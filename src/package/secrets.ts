const INFISICAL_API_BASE = "https://app.infisical.com";

export interface InfisicalConfig {
  token: string;
  projectId: string;
  environment: string;
}

/**
 * Log in to Infisical using Universal Auth (Client ID + Client Secret).
 * Returns a short-lived access token (default 30 day TTL).
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

async function infisicalFetch(
  path: string,
  config: InfisicalConfig,
): Promise<Response> {
  const res = await fetch(`${INFISICAL_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Infisical API GET ${path} → ${res.status}: ${body}`);
  }
  return res;
}

interface InfisicalSecret {
  secretKey: string;
  secretValue: string;
}

interface InfisicalSecretsResponse {
  secrets: InfisicalSecret[];
}

/**
 * Fetch secrets from an Infisical folder path.
 * Returns a key-value record of secret names to values.
 */
export async function fetchInfisicalSecrets(
  config: InfisicalConfig,
  secretPath: string,
): Promise<Record<string, string>> {
  const params = new URLSearchParams({
    workspaceId: config.projectId,
    environment: config.environment,
    secretPath,
  });
  const res = await infisicalFetch(`/api/v3/secrets/raw?${params}`, config);
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
