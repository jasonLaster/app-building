const API_BASE = "https://api.machines.dev/v1";

async function flyFetch(
  path: string,
  token: string,
  opts: RequestInit = {},
): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...((opts.headers as Record<string, string>) ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Fly API ${opts.method ?? "GET"} ${path} → ${res.status}: ${body}`);
  }
  return res;
}

/**
 * Create a Fly app via the Machines API and allocate IPs so .fly.dev DNS works.
 */
export async function createApp(token: string, name: string, org?: string): Promise<void> {
  await flyFetch("/apps", token, {
    method: "POST",
    body: JSON.stringify({ app_name: name, org_slug: org ?? "personal" }),
  });

  // Allocate shared IPv4 and IPv6 via GraphQL so the app gets a .fly.dev domain
  const gqlFetch = async (query: string, variables: Record<string, unknown>) => {
    const res = await fetch("https://api.fly.io/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Fly GraphQL error ${res.status}: ${body}`);
    }
    const data = await res.json() as { errors?: { message: string }[] };
    if (data.errors?.length) {
      throw new Error(`Fly GraphQL: ${data.errors[0].message}`);
    }
  };

  const allocateMutation = `
    mutation($input: AllocateIPAddressInput!) {
      allocateIpAddress(input: $input) {
        ipAddress { id address type }
      }
    }
  `;

  await gqlFetch(allocateMutation, { input: { appId: name, type: "shared_v4" } });
  await gqlFetch(allocateMutation, { input: { appId: name, type: "v6" } });
}

/**
 * Create a Fly Volume in the given region.
 * Returns the volume ID.
 */
export async function createVolume(
  app: string,
  token: string,
  name: string,
  region: string,
  sizeGb: number = 50,
): Promise<string> {
  const res = await flyFetch(`/apps/${app}/volumes`, token, {
    method: "POST",
    body: JSON.stringify({
      name,
      region,
      size_gb: sizeGb,
      encrypted: true,
      require_unique_zone: false,
    }),
  });
  const data = (await res.json()) as { id: string };
  return data.id;
}

/**
 * Delete a Fly Volume.
 */
export async function deleteVolume(
  app: string,
  token: string,
  volumeId: string,
): Promise<void> {
  await flyFetch(`/apps/${app}/volumes/${volumeId}`, token, {
    method: "DELETE",
  });
}

export interface CreateMachineResult {
  machineId: string;
  volumeId: string;
}

/**
 * Create a Fly Machine with the given image and env vars.
 * Creates a volume mounted at /repo for storage.
 * Returns the machine ID and volume ID.
 */
export async function createMachine(
  app: string,
  token: string,
  image: string,
  env: Record<string, string>,
  name: string,
): Promise<CreateMachineResult> {

  const volumeName = `repo_${name.replace(/-/g, "_")}`.slice(0, 30);

  // Regions to try in order. dfw and iad have the most reliable capacity for
  // performance machines. Fall back to ord and sjc if needed.
  const regions = ["dfw", "iad", "ord", "sjc"];

  // Delete unattached volumes in parallel with creating the new machine.
  let cleanupDone: Promise<unknown> | undefined;

  for (const region of regions) {
    const volumeId = await createVolume(app, token, volumeName, region, 50);

    // Start cleanup on first attempt only
    if (!cleanupDone) {
      cleanupDone = listVolumes(app, token).then(vols => Promise.all(
        vols.map(async ({ id, attached_machine_id }) => {
          if (attached_machine_id || id === volumeId)
            return;
          await deleteVolume(app, token, id).catch(() => {});
        }),
      ));
    }

    try {
      const res = await flyFetch(`/apps/${app}/machines`, token, {
        method: "POST",
        body: JSON.stringify({
          name,
          region,
          config: {
            image,
            env,
            auto_destroy: true,
            restart: { policy: "on-failure", max_retries: 3 },
            guest: {
              cpu_kind: "performance",
              cpus: 16,
              memory_mb: 32768,
            },
            mounts: [{ volume: volumeId, path: "/repo" }],
            services: [
              {
                ports: [{ port: 443, handlers: ["tls", "http"] }],
                protocol: "tcp",
                internal_port: 3000,
                autostart: false,
                autostop: "off",
              },
            ],
          },
        }),
      });

      const data = (await res.json()) as { id: string };
      await cleanupDone;
      return { machineId: data.id, volumeId };
    } catch (err) {
      await deleteVolume(app, token, volumeId).catch(() => {});

      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("412")) {
        console.log(`Insufficient resources in ${region}, trying next region...`);
        continue;
      }
      throw err;
    }
  }

  throw new Error("Failed to create machine after exhausting retries");
}

/**
 * Wait for a Fly Machine to reach the "started" state.
 */
export async function waitForMachine(
  app: string,
  token: string,
  machineId: string,
  timeoutMs: number = 180000,
): Promise<void> {
  const start = Date.now();
  let lastLogTime = 0;
  while (Date.now() - start < timeoutMs) {
    try {
      await flyFetch(
        `/apps/${app}/machines/${machineId}/wait?state=started&timeout=60`,
        token,
      );
      return;
    } catch (e) {
      const now = Date.now();
      const elapsed = Math.round((now - start) / 1000);
      // Only log at most once every 10 seconds
      if (now - lastLogTime >= 10000) {
        console.log(`Still waiting for machine to start (${elapsed}s elapsed): ${e instanceof Error ? e.message : e}`);
        lastLogTime = now;
      }
      // Wait before retrying
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  throw new Error(`Machine ${machineId} did not reach started state within ${timeoutMs / 1000}s`);
}

/**
 * Destroy a Fly Machine (force) and its attached volume.
 */
export async function destroyMachine(
  app: string,
  token: string,
  machineId: string,
  volumeId?: string,
): Promise<void> {
  await flyFetch(`/apps/${app}/machines/${machineId}?force=true`, token, {
    method: "DELETE",
  });
  if (volumeId) {
    await deleteVolume(app, token, volumeId).catch((err) => {
      console.log(`Warning: failed to delete volume ${volumeId}: ${err instanceof Error ? err.message : err}`);
    });
  }
}

export interface FlyMachineInfo {
  id: string;
  name: string;
  state: string;
  created_at: string;
  region: string;
}

/**
 * List all machines for a Fly app.
 */
export async function listMachines(
  app: string,
  token: string,
): Promise<FlyMachineInfo[]> {
  const res = await flyFetch(`/apps/${app}/machines`, token);
  return (await res.json()) as FlyMachineInfo[];
}

export interface FlyVolumeInfo {
  id: string;
  name: string;
  state: string;
  size_gb: number;
  region: string;
  created_at: string;
  attached_machine_id: string | null;
}

/**
 * List all volumes for a Fly app.
 */
export async function listVolumes(
  app: string,
  token: string,
): Promise<FlyVolumeInfo[]> {
  const res = await flyFetch(`/apps/${app}/volumes`, token);
  return (await res.json()) as FlyVolumeInfo[];
}
