#!/usr/bin/env node
import { run } from "../core/runner.js";
const cmd = process.argv[2] || "test";
const targetPath = process.argv.find((a) => !a.startsWith("-") && a !== cmd && a !== process.argv[0] && a !== process.argv[1]);
const json = process.argv.includes("--json");
const bail = process.argv.includes("--bail");
const timeoutArg = process.argv.find((a) => a.startsWith("--timeout="));
const concArg = process.argv.find((a) => a.startsWith("--concurrency="));
const timeout = timeoutArg ? parseInt(timeoutArg.split("=")[1]) : undefined;
const concurrency = concArg ? parseInt(concArg.split("=")[1]) : undefined;
async function main() {
    if (cmd === "test") {
        const summary = await run(targetPath, { concurrency, bail });
        if (summary.failed > 0)
            process.exitCode = 1;
        if (json) {
            console.log(JSON.stringify(summary));
        }
    }
    else {
        console.log(`Unknown command: ${cmd}`);
        process.exit(1);
    }
}
main();
