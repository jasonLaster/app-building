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
 * Create a Fly Machine with the given image and env vars.
 * Returns the machine ID.
 */
export async function createMachine(
  app: string,
  token: string,
  image: string,
  env: Record<string, string>,
  name: string,
): Promise<string> {
  const res = await flyFetch(`/apps/${app}/machines`, token, {
    method: "POST",
    body: JSON.stringify({
      name,
      config: {
        image,
        env,
        auto_destroy: true,
        restart: { policy: "no" },
        guest: {
          cpu_kind: "performance",
          cpus: 16,
          memory_mb: 32768,
        },
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
  return data.id;
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
  while (Date.now() - start < timeoutMs) {
    try {
      await flyFetch(
        `/apps/${app}/machines/${machineId}/wait?state=started&timeout=60`,
        token,
      );
      return;
    } catch (e) {
      const elapsed = Math.round((Date.now() - start) / 1000);
      console.log(`Still waiting for machine to start (${elapsed}s elapsed): ${e instanceof Error ? e.message : e}`);
    }
  }
  throw new Error(`Machine ${machineId} did not reach started state within ${timeoutMs / 1000}s`);
}

/**
 * Destroy a Fly Machine (force).
 */
export async function destroyMachine(
  app: string,
  token: string,
  machineId: string,
): Promise<void> {
  await flyFetch(`/apps/${app}/machines/${machineId}?force=true`, token, {
    method: "DELETE",
  });
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
