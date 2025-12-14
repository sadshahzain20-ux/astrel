import { TestResult } from "./result.js"
import { createTestEnv } from "./parser.js"
import { report } from "./reporter.js"
import { scan } from "./scanner.js"
import { execute } from "./executor.js"

export interface RunOptions {
  concurrency?: number
  bail?: boolean
}

export async function run(root?: string, options?: RunOptions) {
  const results: TestResult[] = []

  createTestEnv(results)

  const targets = await scan(root ?? process.cwd())
  await execute(targets, results, root ?? process.cwd(), options)

  return report(results)
}
