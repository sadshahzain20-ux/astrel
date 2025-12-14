import { capitalize, reverse, isPalindrome } from "./string.js"

test("capitalize first letter", () => {
  expect(capitalize("hello")).toBe("Hello")
})

test("reverse string", () => {
  expect(reverse("abc")).toBe("cba")
})

test("palindrome check", () => {
  expect(isPalindrome("racecar")).toBe(true)
  expect(isPalindrome("hello")).toBe(false)
})