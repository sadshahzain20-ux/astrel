import { TestResult } from "./result.js"
import { expect } from "./assertions.js"

export type TestFn = () => void

export function createTestEnv(results: TestResult[]) {
  globalThis.test = (name: string, fn: TestFn) => {
    const start = Date.now()
    try {
      fn()
      results.push({
        name,
        status: "pass",
        duration: Date.now() - start
      })
    } catch (e: any) {
      results.push({
        name,
        status: "fail",
        error: e.message,
        duration: Date.now() - start
      })
    }
  }
  ;(globalThis as any).expect = expect
}
