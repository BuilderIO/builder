---
'@builder.io/sdk': major
'@builder.io/react': major
---

Breaking Change: Use `/query` instead of `/content` for API calls. This reverts https://github.com/BuilderIO/builder/pull/3681, which introduced a bug in how symbols are rendered.

With this current breaking change, symbols are rendered correctly again.
