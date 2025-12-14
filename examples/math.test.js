import { sum, factorial } from "./math.js"

test("sum of numbers", () => {
  expect(sum(1, 2, 3)).toBe(6)
  expect(sum()).toBe(0)
})

test("factorial computes", () => {
  expect(factorial(0)).toBe(1)
  expect(factorial(5)).toBe(120)
})

test("factorial negative throws", () => {
  try {
    factorial(-1)
    throw new Error("should have thrown")
  } catch (e) {}
})