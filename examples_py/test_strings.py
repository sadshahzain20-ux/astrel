def reverse(s):
    return s[::-1]

def is_palindrome(s):
    return s == reverse(s)

assert reverse("abc") == "cba"
assert is_palindrome("racecar")
assert not is_palindrome("hello")