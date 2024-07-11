---
'@builder.io/react': major
'@builder.io/sdk-react': major
'@builder.io/sdk-react-native': major
'@builder.io/sdk-solid': major
'@builder.io/sdk-svelte': major
'@builder.io/sdk-vue': major
'@builder.io/sdk-angular': minor
'@builder.io/sdk-react-nextjs': minor
'@builder.io/sdk-qwik': minor
---

Breaking Change 🧨: Columns block now computes percentage widths correctly, by subtracting gutter space proportionally to each percentage.
Previously, it computed the column's widths by subtracting gutter space equally from each column's width. This previous behavior was incorrect, and most strongly felt when the `space` was a substantially high percentage of the total width of the Columns block.
