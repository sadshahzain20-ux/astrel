import { add, sub, mul, div } from "./calculator.js"

test("add works", () => {
  expect(add(1, 2)).toBe(3)
})

test("sub works", () => {
  expect(sub(5, 2)).toBe(3)
})

test("mul works", () => {
  expect(mul(3, 4)).toBe(12)
})

test("div works", () => {
  expect(div(8, 2)).toBe(4)
})

test("div by zero throws", () => {
  try {
    div(1, 0)
    throw new Error("should have thrown")
  } catch (e) {}
})