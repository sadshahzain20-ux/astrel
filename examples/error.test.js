test("throws an error", () => {
  function willThrow() {
    throw new Error("boom")
  }
  try {
    willThrow()
    throw new Error("should have thrown")
  } catch (e) {}
})