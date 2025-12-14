import { TestResult } from "./result.js"
import { createTestEnv } from "./parser.js"
import { report } from "./reporter.js"
import { pathToFileURL } from "node:url"

export async function run(adapter: () => Promise<string[]>) {
  const results: TestResult[] = []

  createTestEnv(results)

  const testFiles = await adapter()

  for (const file of testFiles) {
    try {
      await import(pathToFileURL(file).href)
    } catch (e: any) {
      results.push({
        name: file,
        status: "fail",
        error: e?.message ?? String(e),
        duration: 0
      })
    }
  }

  report(results)
}
