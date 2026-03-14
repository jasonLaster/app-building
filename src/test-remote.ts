/**
 * Quick smoke test for --remote interactive mode.
 * Starts a remote container, sends two messages, checks for:
 * 1. No event duplication across messages
 * 2. Session continuity (message 2 should remember message 1's context)
 */
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { loadDotEnv, FileContainerRegistry, type ContainerConfig, type RepoOptions, httpGet, httpPost, type HttpOptions, getInfisicalConfig } from "./package";
import { startRemoteContainer, stopRemoteContainer } from "./remote-container";

const __dirname = dirname(fileURLToPath(import.meta.url));
import { getLocalRemoteUrl, getLocalBranch } from "./git";

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function waitForMessage(
  baseUrl: string,
  id: string,
  httpOpts: HttpOptions,
): Promise<{ status: string; result?: { result: string }; error?: string }> {
  while (true) {
    const msg = await httpGet(`${baseUrl}/message/${id}`, httpOpts);
    if (msg.status === "done" || msg.status === "error") {
      return msg;
    }
    await sleep(1000);
  }
}

async function main() {
  const projectRoot = resolve(__dirname, "..");
  const orchestrationVars = loadDotEnv(projectRoot);
  const infisicalConfig = await getInfisicalConfig(orchestrationVars);

  const containerEnvVars: Record<string, string> = {
    INFISICAL_TOKEN: infisicalConfig.token,
    INFISICAL_PROJECT_ID: infisicalConfig.projectId,
    INFISICAL_ENVIRONMENT: infisicalConfig.environment,
  };

  const config: ContainerConfig = {
    projectRoot,
    envVars: containerEnvVars,
    registry: new FileContainerRegistry(resolve(projectRoot, ".container-registry.jsonl")),
    flyToken: orchestrationVars.FLY_API_TOKEN,
    flyApp: orchestrationVars.FLY_APP_NAME,
  };

  const repo = getLocalRemoteUrl();
  const branch = getLocalBranch();

  const repoOpts: RepoOptions = {
    repoUrl: repo,
    cloneBranch: branch,
    pushBranch: branch,
  };

  console.log("Starting remote container...");
  const state = await startRemoteContainer(config, repoOpts);
  console.log(`Machine: ${state.flyMachineId}`);
  console.log(`URL: ${state.baseUrl}`);

  const httpOpts: HttpOptions = state.flyMachineId
    ? { headers: { "fly-force-instance-id": state.flyMachineId } }
    : {};

  let passed = true;
  const fail = (msg: string) => {
    console.error(`FAIL: ${msg}`);
    passed = false;
  };

  try {
    // --- Message 1: Establish context ---
    console.log("\n=== Sending message 1 ===");
    const { id: id1 } = await httpPost(
      `${state.baseUrl}/message`,
      { prompt: "Remember this secret code: ZEBRA42. Just acknowledge you received it." },
      httpOpts,
    );
    console.log(`Message 1 ID: ${id1}`);
    const msg1 = await waitForMessage(state.baseUrl, id1, httpOpts);
    console.log(`Message 1 status: ${msg1.status}`);
    if (msg1.status === "error") {
      fail(`Message 1 error: ${msg1.error}`);
      return;
    }

    // Fetch events after message 1
    const events1 = await httpGet(`${state.baseUrl}/events?offset=0`, httpOpts);
    console.log(`Events after message 1: ${events1.items.length} items`);
    const offset1 = events1.nextOffset;

    // --- Message 2: Test session continuity ---
    console.log("\n=== Sending message 2 ===");
    const { id: id2 } = await httpPost(
      `${state.baseUrl}/message`,
      { prompt: "What was the secret code I told you? Reply with just the code." },
      httpOpts,
    );
    console.log(`Message 2 ID: ${id2}`);
    const msg2 = await waitForMessage(state.baseUrl, id2, httpOpts);
    console.log(`Message 2 status: ${msg2.status}`);
    if (msg2.status === "error") {
      fail(`Message 2 error: ${msg2.error}`);
      return;
    }

    // Fetch events after message 2
    const events2 = await httpGet(`${state.baseUrl}/events?offset=${offset1}`, httpOpts);
    console.log(`Events after message 2 (from offset ${offset1}): ${events2.items.length} items`);

    // --- Check 1: No event duplication ---
    // Verify offset-based pagination works: message 2's events should be
    // a small set, not a replay of everything.
    const allEvents = await httpGet(`${state.baseUrl}/events?offset=0`, httpOpts);
    console.log(`\nTotal events: ${allEvents.items.length}, msg1: ${events1.items.length}, msg2: ${events2.items.length}`);
    if (events2.items.length >= events1.items.length * 2) {
      fail(`Likely event duplication: message 2 has ${events2.items.length} events vs message 1's ${events1.items.length}`);
    } else {
      console.log("PASS: No event duplication detected.");
    }

    // --- Check 2: Session continuity ---
    const result2 = msg2.result?.result ?? "";
    console.log(`\nMessage 2 result: ${result2.slice(0, 200)}`);
    if (result2.includes("ZEBRA42")) {
      console.log("PASS: Session continuity verified (message 2 remembers secret code).");
    } else {
      fail("Session continuity broken: message 2 does not contain 'ZEBRA42'");
    }

    // --- Check 3: Verify status endpoint ---
    const status = await httpGet(`${state.baseUrl}/status`, httpOpts);
    console.log(`\nStatus: state=${status.state} iteration=${status.iteration} totalCost=$${status.totalCost?.toFixed(4)}`);
    if (status.iteration !== 2) {
      fail(`Expected iteration=2, got ${status.iteration}`);
    } else {
      console.log("PASS: Iteration count correct.");
    }

    // --- Summary ---
    console.log(`\n${"=".repeat(40)}`);
    console.log(passed ? "ALL TESTS PASSED" : "SOME TESTS FAILED");

  } finally {
    console.log("\nCleaning up...");
    await stopRemoteContainer(config, state);
    console.log("Done.");
  }

  if (!passed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
