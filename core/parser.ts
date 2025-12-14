import { TestResult } from "./result.js"
import { expect } from "./assertions.js"

export type TestFn = () => any | Promise<any>
type Hook = () => any | Promise<any>

export function createTestEnv(results: TestResult[]) {
  const before: Hook[] = []
  const after: Hook[] = []
  const only = new Set<string>()

  function runHookList(list: Hook[]) {
    for (const h of list) {
      const r = h()
      if (r && typeof (r as any).then === "function") {
        ;(r as Promise<any>).catch(() => {})
      }
    }
  }

  function runTest(name: string, fn: TestFn, timeout?: number) {
    const start = Date.now()
    try {
      for (const h of before) {
        const rh = h()
        if (rh && typeof (rh as any).then === "function") {
          ;(rh as Promise<any>).catch(() => {})
        }
      }
      const ret = fn()
      if (ret && typeof (ret as any).then === "function") {
        let done = false
        const onResolve = () => {
          if (done) return
          done = true
          results.push({ name, status: "pass", duration: Date.now() - start })
          runHookList(after)
        }
        const onReject = (e: any) => {
          if (done) return
          done = true
          results.push({ name, status: "fail", error: e?.message ?? String(e), duration: Date.now() - start })
          runHookList(after)
        }
        const p = ret as Promise<any>
        p.then(onResolve, onReject)
        if (timeout && timeout > 0) {
          setTimeout(() => {
            if (done) return
            done = true
            results.push({ name, status: "fail", error: "timeout", duration: Date.now() - start })
            runHookList(after)
          }, timeout)
        }
        return
      }
      results.push({
        name,
        status: "pass",
        duration: Date.now() - start
      })
      runHookList(after)
    } catch (e: any) {
      results.push({
        name,
        status: "fail",
        error: e?.message ?? String(e),
        duration: Date.now() - start
      })
      runHookList(after)
    }
  }
  ;(globalThis as any).test = ((name: string, fn: TestFn, timeout?: number) => {
    if (only.size > 0 && !only.has(name)) {
      results.push({ name, status: "skip", duration: 0 })
      return
    }
    runTest(name, fn, timeout)
  }) as any
  ;(globalThis as any).test.skip = (name: string) => {
    results.push({ name, status: "skip", duration: 0 })
  }
  ;(globalThis as any).test.only = (name: string, fn: TestFn, timeout?: number) => {
    only.add(name)
    runTest(name, fn, timeout)
  }
  ;(globalThis as any).beforeEach = (h: Hook) => {
    before.push(h)
  }
  ;(globalThis as any).afterEach = (h: Hook) => {
    after.push(h)
  }
  ;(globalThis as any).expect = expect
}
