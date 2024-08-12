---
'@builder.io/react': major
---

Breaking Change 🧨: `userAttributes` now is parsed as an object - `JSON.stringify(userAttributes)` which preserves strings. Users no longer need to manually stringify anything unless they have explicitly included it in custom targeting attributes.

For example,

```js
userAttributes: {
  stringWithStrs: ['a', 'c'];
}
```

used to work as well as this,

```js
userAttributes: {
  stringWithStrs: ["'a'", "'c'"];
}
```

but now its not needed to manually stringify strings. This change was needed to preserve data types and strings so previously when we passed,

```js
userAttributes: {
  stringWithNums: ['1', '2'];
}
```

they were actual string numbers but we failed to parse it because we were not preserving the strings and users had to perform manual stringification hacks like "'1'" to achieve correct result. With this change stringified numbers/bools etc will work out of the box as expected showing less room for randomness.
