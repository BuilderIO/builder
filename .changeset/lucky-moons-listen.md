---
'@builder.io/react': patch
---

Fix: editing a block inside a Symbol's Slot no longer remounts the whole Symbol. Slot content is stored in `symbol.data.<slotName>`, which was part of the hash used to key the Symbol's nested `BuilderComponent`, so every edit to a slot child tore down and rebuilt the subtree. In the Visual Editor that destroyed the DOM node of the selected block, making the inline edit popup flicker while typing. Block values are now excluded from that key while editing; live rendering keeps its existing key.
