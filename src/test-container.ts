import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
import { loadDotEnv, FileContainerRegistry, type ContainerConfig, spawnTestContainer, getInfisicalConfig } from "./package";

const projectRoot = resolve(__dirname, "..");
const orchestrationVars = loadDotEnv(projectRoot);

async function main() {
  const infisicalConfig = await getInfisicalConfig(orchestrationVars);

  const config: ContainerConfig = {
    projectRoot,
    infisical: infisicalConfig,
    registry: new FileContainerRegistry(resolve(projectRoot, ".container-registry.jsonl")),
  };

  await spawnTestContainer(config);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
