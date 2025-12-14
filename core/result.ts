export type TestStatus = "pass" | "fail"

export interface TestResult {
  name: string
  status: TestStatus
  error?: string
  duration?: number
}
