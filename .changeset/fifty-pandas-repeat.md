---
'@builder.io/sdk': major
---

Fix: Reintroduced `JSON.stringify(userAttributes)` change to standardize parsing logic and preserve strings. This is a breaking change as it doesn't require manual stringification of `userAttributes` values. Ensure that attributes are not manually stringified before passing them to avoid potential issues.
