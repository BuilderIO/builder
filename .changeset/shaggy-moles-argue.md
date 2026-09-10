---
'@builder.io/react': patch
---

Fix: Custom Code blocks with `scriptsClientOnly` now re-insert and run their `<script>` tags after hydration. `shouldComponentUpdate` was only comparing `props.code`, which suppressed the one-time re-render triggered by `componentDidMount`.
