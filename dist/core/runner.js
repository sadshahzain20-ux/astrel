import { createTestEnv } from "./parser.js";
import { report } from "./reporter.js";
import { scan } from "./scanner.js";
import { execute } from "./executor.js";
export async function run(root, options) {
    const results = [];
    createTestEnv(results);
    const targets = await scan(root ?? process.cwd());
    await execute(targets, results, root ?? process.cwd(), options);
    return report(results);
}
