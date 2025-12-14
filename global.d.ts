declare global {
  function test(name: string, fn: () => any | Promise<any>, timeout?: number): void
  namespace test {
    function skip(name: string): void
    function only(name: string, fn: () => any | Promise<any>, timeout?: number): void
  }
  function expect(value: any): { toBe(expected: any): void }
  function beforeEach(fn: () => any | Promise<any>): void
  function afterEach(fn: () => any | Promise<any>): void
}

export {}
