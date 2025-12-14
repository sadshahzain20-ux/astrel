import { TestResult } from "./result.js"

export function report(results: TestResult[]) {
  console.log("ASTREL v0.1\n")

  let passed = 0
  let failed = 0
  let skipped = 0

  for (const r of results) {
    if (r.status === "pass") {
      passed++
      console.log(`✓ ${r.name}`)
    } else if (r.status === "fail") {
      failed++
      console.log(`✗ ${r.name}`)
      console.log(`  ${r.error}`)
    } else {
      skipped++
      console.log(`- ${r.name}`)
      if (r.error) console.log(`  ${r.error}`)
    }
  }

  console.log(
    `\n${results.length} tests | ${passed} passed | ${failed} failed | ${skipped} skipped`
  )
}
