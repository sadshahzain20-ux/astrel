declare global {
  function test(name: string, fn: () => void): void
  function expect(value: any): { toBe(expected: any): void }
}

export {}
