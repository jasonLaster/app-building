import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
import { loadDotEnv, listMachines, destroyMachine, listVolumes, deleteVolume } from "./package";

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";

function getFlyConfig(): { token: string; app: string } {
  const projectRoot = resolve(__dirname, "..");
  const envVars = loadDotEnv(projectRoot);
  const token = envVars.FLY_API_TOKEN ?? process.env.FLY_API_TOKEN;
  const app = envVars.FLY_APP_NAME ?? process.env.FLY_APP_NAME;
  if (!token) {
    console.error(`${RED}FLY_API_TOKEN not set in .env${RESET}`);
    process.exit(1);
  }
  if (!app) {
    console.error(`${RED}FLY_APP_NAME not set in .env${RESET}`);
    process.exit(1);
  }
  return { token, app };
}

async function list(): Promise<void> {
  const { token, app } = getFlyConfig();
  const machines = await listMachines(app, token);

  if (machines.length === 0) {
    console.log(`No machines running in ${BOLD}${app}${RESET}`);
    return;
  }

  console.log(`\n${BOLD}Machines in ${app}${RESET}\n`);
  for (const m of machines) {
    const stateColor = m.state === "started" ? GREEN : m.state === "stopped" ? RED : YELLOW;
    console.log(`  ${DIM}${m.id}${RESET}  ${m.name}  ${stateColor}${m.state}${RESET}  ${DIM}${m.region}  ${m.created_at}${RESET}`);
  }
  console.log();
}

async function destroyAll(): Promise<void> {
  const { token, app } = getFlyConfig();
  const machines = await listMachines(app, token);

  if (machines.length === 0) {
    console.log("No machines to destroy.");
    return;
  }

  for (const m of machines) {
    console.log(`Destroying machine ${m.id} (${m.name}, ${m.state})...`);
    await destroyMachine(app, token, m.id).catch((e) =>
      console.log(`  Failed: ${e instanceof Error ? e.message : e}`),
    );
  }

  const volumes = await listVolumes(app, token);
  for (const v of volumes) {
    console.log(`Deleting volume ${v.id} (${v.name}, ${v.size_gb}GB)...`);
    await deleteVolume(app, token, v.id).catch((e) =>
      console.log(`  Failed: ${e instanceof Error ? e.message : e}`),
    );
  }

  console.log("Done.");
}

async function main(): Promise<void> {
  const command = process.argv[2];

  if (command === "list" || !command) {
    await list();
  } else if (command === "destroy-all") {
    await destroyAll();
  } else {
    console.error(`Unknown command: ${command}`);
    console.error("Usage: npm run fly-machines [list|destroy-all]");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
