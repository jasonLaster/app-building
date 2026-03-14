/**
 * Infisical secrets API.
 *
 * API versions used (per https://infisical.com/docs/api-reference):
 *   - Auth:    POST /api/v1/auth/universal-auth/login
 *   - Secrets: GET/POST/PATCH /api/v4/secrets[/{secretName}]
 *   - Folders: POST /api/v2/folders
 */

const INFISICAL_API_BASE = "https://app.infisical.com";

export interface InfisicalConfig {
  token: string;
  projectId: string;
  environment: string;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * Log in to Infisical using Universal Auth (Client ID + Client Secret).
 * POST /api/v1/auth/universal-auth/login
 * Returns a short-lived access token.
 */
export async function infisicalLogin(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const res = await fetch(`${INFISICAL_API_BASE}/api/v1/auth/universal-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, clientSecret }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Infisical login failed → ${res.status}: ${body}`);
  }
  const data = (await res.json()) as { accessToken: string };
  return data.accessToken;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeaders(config: InfisicalConfig): Record<string, string> {
  return {
    Authorization: `Bearer ${config.token}`,
    "Content-Type": "application/json",
  };
}

// ---------------------------------------------------------------------------
// Secrets — read
// ---------------------------------------------------------------------------

interface InfisicalSecret {
  secretKey: string;
  secretValue: string;
}

interface InfisicalSecretsResponse {
  secrets: InfisicalSecret[];
}

/**
 * Fetch secrets from an Infisical folder path.
 * GET /api/v4/secrets?projectId=…&environment=…&secretPath=…
 * Returns a key→value record.
 */
export async function fetchInfisicalSecrets(
  config: InfisicalConfig,
  secretPath: string,
): Promise<Record<string, string>> {
  const params = new URLSearchParams({
    projectId: config.projectId,
    environment: config.environment,
    secretPath,
  });
  const res = await fetch(`${INFISICAL_API_BASE}/api/v4/secrets?${params}`, {
    headers: authHeaders(config),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Infisical GET secrets ${secretPath} → ${res.status}: ${body}`);
  }
  const data = (await res.json()) as InfisicalSecretsResponse;
  const secrets: Record<string, string> = {};
  for (const s of data.secrets) {
    secrets[s.secretKey] = s.secretValue;
  }
  return secrets;
}

/**
 * Fetch global build secrets from `/global/`.
 */
export async function fetchGlobalSecrets(
  config: InfisicalConfig,
): Promise<Record<string, string>> {
  return fetchInfisicalSecrets(config, "/global/");
}

/**
 * Fetch per-branch deployment secrets from `/branches/<branch>/`.
 */
export async function fetchBranchSecrets(
  config: InfisicalConfig,
  branch: string,
): Promise<Record<string, string>> {
  return fetchInfisicalSecrets(config, `/branches/${branch}/`);
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

/**
 * Ensure all folders in a path exist, creating any missing ones.
 * POST /api/v2/folders  — body: { projectId, environment, name, path }
 *
 * Infisical requires folders to exist before secrets can be written into them.
 * We walk each segment of the path and issue a create; a 400 response means
 * the folder already exists (the docs list 400 for "Bad Request" which
 * Infisical returns for duplicate folder names).
 */
async function ensureFolder(
  config: InfisicalConfig,
  folderPath: string,
): Promise<void> {
  const segments = folderPath.split("/").filter(Boolean);
  let parentPath = "/";

  for (const segment of segments) {
    const res = await fetch(`${INFISICAL_API_BASE}/api/v2/folders`, {
      method: "POST",
      headers: authHeaders(config),
      body: JSON.stringify({
        projectId: config.projectId,
        environment: config.environment,
        name: segment,
        path: parentPath,
      }),
    });
    // 200 = created. 400 = folder already exists (Infisical returns 400 for
    // duplicate folder names under the same parent).
    if (res.ok || res.status === 400) {
      parentPath += segment + "/";
      continue;
    }
    const text = await res.text().catch(() => "");
    throw new Error(`Infisical create folder ${parentPath}${segment} → ${res.status}: ${text}`);
  }
}

// ---------------------------------------------------------------------------
// Secrets — write
// ---------------------------------------------------------------------------

/**
 * Create or update a branch secret in Infisical.
 * Creates the folder path if it doesn't exist yet.
 *
 *   POST  /api/v4/secrets/{name}   — create
 *   PATCH /api/v4/secrets/{name}   — update (if secret already exists)
 *
 * Body: { projectId, environment, secretPath, secretValue, type }
 */
export async function createBranchSecret(
  config: InfisicalConfig,
  branch: string,
  name: string,
  value: string,
): Promise<void> {
  const secretPath = `/branches/${branch}/`;
  const url = `${INFISICAL_API_BASE}/api/v4/secrets/${encodeURIComponent(name)}`;
  const body = {
    projectId: config.projectId,
    environment: config.environment,
    secretPath,
    secretValue: value,
    type: "shared",
  };
  const headers = authHeaders(config);

  // --- Try POST (create) ---------------------------------------------------
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (res.ok) return;

  // Secret already exists → PATCH to update
  if (res.status === 400) {
    const patchRes = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    if (patchRes.ok) return;
    const text = await patchRes.text().catch(() => "");
    throw new Error(`Infisical PATCH ${name} → ${patchRes.status}: ${text}`);
  }

  // Folder doesn't exist → create folders then retry POST
  if (res.status === 404) {
    await ensureFolder(config, secretPath);
    const retryRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (retryRes.ok) return;
    // Retry may 400 if another process created it concurrently → try PATCH
    if (retryRes.status === 400) {
      const patchRes = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      if (patchRes.ok) return;
      const text = await patchRes.text().catch(() => "");
      throw new Error(`Infisical PATCH ${name} (after folder creation) → ${patchRes.status}: ${text}`);
    }
    const text = await retryRes.text().catch(() => "");
    throw new Error(`Infisical POST ${name} (after folder creation) → ${retryRes.status}: ${text}`);
  }

  const text = await res.text().catch(() => "");
  throw new Error(`Infisical POST ${name} → ${res.status}: ${text}`);
}

// ---------------------------------------------------------------------------
// Config helper
// ---------------------------------------------------------------------------

/**
 * Extract Infisical config from environment variables and log in.
 * Reads INFISICAL_CLIENT_ID, INFISICAL_CLIENT_SECRET, INFISICAL_PROJECT_ID,
 * and INFISICAL_ENVIRONMENT from the env vars.
 * Throws if any required var is missing.
 */
export async function getInfisicalConfig(
  envVars: Record<string, string>,
): Promise<InfisicalConfig> {
  const clientId = envVars.INFISICAL_CLIENT_ID;
  const clientSecret = envVars.INFISICAL_CLIENT_SECRET;
  const projectId = envVars.INFISICAL_PROJECT_ID;
  const environment = envVars.INFISICAL_ENVIRONMENT;
  const missing = [
    !clientId && "INFISICAL_CLIENT_ID",
    !clientSecret && "INFISICAL_CLIENT_SECRET",
    !projectId && "INFISICAL_PROJECT_ID",
    !environment && "INFISICAL_ENVIRONMENT",
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(`Missing Infisical config in .env: ${missing.join(", ")}`);
  }
  const token = await infisicalLogin(clientId!, clientSecret!);
  return { token, projectId: projectId!, environment: environment! };
}
