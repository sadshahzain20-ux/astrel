export type TestStatus = "pass" | "fail" | "skip"

export interface TestResult {
  name: string
  status: TestStatus
  error?: string
  duration?: number
}
