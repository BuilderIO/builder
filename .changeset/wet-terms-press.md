---
"@builder.io/sdk-react-nextjs": patch
"@builder.io/sdk-react": patch
"@builder.io/sdk-react-native": patch
---

Fix: remove redundant `<Show>` wrapper around `<For>` in `component-ref` that was wrapping custom component `children` in a `React.Fragment`, breaking `React.Children.count` and iteration.
