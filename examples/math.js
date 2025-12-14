export function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0)
}

export function factorial(n) {
  if (n < 0) throw new Error("negative not allowed")
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}