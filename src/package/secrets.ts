import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const INFISICAL_API_BASE = "https://app.infisical.com";

/** Keys listed in src/package/.env.example that must be present in container secrets. */
function getRequiredSecretKeys(): string[] {
  const examplePath = resolve(__dirname, ".env.example");
  return readFileSync(examplePath, "utf-8")
    .split("\n")
    .map((l) => l.split("#")[0].trim())
    .filter((l) => l && l.includes("="))
    .map((l) => l.split("=")[0].trim());
}

export interface InfisicalConfig {
  token: string;
  projectId: string;
  environment: string;
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
 * Resolve the full set of secrets to inject into a container:
 * global build secrets + Infisical config vars (so the container can fetch branch secrets).
 * Throws if any required secret from .env.example is missing.
 */
export async function resolveContainerSecrets(
  config: InfisicalConfig,
): Promise<Record<string, string>> {
  const globals = await fetchGlobalSecrets(config);
  const secrets: Record<string, string> = {
    ...globals,
    INFISICAL_TOKEN: config.token,
    INFISICAL_PROJECT_ID: config.projectId,
    INFISICAL_ENVIRONMENT: config.environment,
  };

  const required = getRequiredSecretKeys();
  const missing = required.filter((k) => !secrets[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required secrets in Infisical /global/: ${missing.join(", ")}`);
  }

  return secrets;
}

/**
 * Extract Infisical config from environment variables.
 * Throws if any required Infisical var is missing.
 */
export function getInfisicalConfig(
  envVars: Record<string, string>,
): InfisicalConfig {
  const token = envVars.INFISICAL_TOKEN;
  const projectId = envVars.INFISICAL_PROJECT_ID;
  const environment = envVars.INFISICAL_ENVIRONMENT;
  const missing = [
    !token && "INFISICAL_TOKEN",
    !projectId && "INFISICAL_PROJECT_ID",
    !environment && "INFISICAL_ENVIRONMENT",
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(`Missing Infisical config in .env: ${missing.join(", ")}`);
  }
  return { token: token!, projectId: projectId!, environment: environment! };
}
