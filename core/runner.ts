import { TestResult } from "./result.js"
import { createTestEnv } from "./parser.js"
import { report } from "./reporter.js"
import { scan } from "./scanner.js"
import { execute } from "./executor.js"

export async function run() {
  const results: TestResult[] = []

  createTestEnv(results)

  const targets = await scan()
  await execute(targets, results)

  report(results)
}
