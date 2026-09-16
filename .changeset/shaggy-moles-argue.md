---
'@builder.io/react': patch
---

Fix: Custom Code blocks with `scriptsClientOnly` now re-insert and run their `<script>` tags after hydration. Two things blocked it: the first client render only matched the script-stripped server render when the SSR'd node happened to be captured at module-evaluation time (not guaranteed with async chunk loading, e.g. Next.js), and `shouldComponentUpdate` only compared `props.code`, suppressing the one-time re-render scheduled by `componentDidMount`.
