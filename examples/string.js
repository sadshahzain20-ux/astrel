export function capitalize(s) {
  if (s.length === 0) return s
  return s[0].toUpperCase() + s.slice(1)
}

export function reverse(s) {
  return s.split("").reverse().join("")
}

export function isPalindrome(s) {
  const r = reverse(s)
  return s === r
}