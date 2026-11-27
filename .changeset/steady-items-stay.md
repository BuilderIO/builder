---
'@builder.io/sdk-react': patch
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-solid': patch
---

Fix Accordion `useChildrenForItems` remounting open items on unrelated state changes (visible in Solid) by keeping the computed items stable until their inputs change.
