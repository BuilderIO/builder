---
'@builder.io/react': patch
---

Fix: editing a block inside a Symbol's Slot no longer remounts the Symbol. Slot content lives in `symbol.data.<slotName>`, which keyed the nested `BuilderComponent`, so every keystroke rebuilt the subtree and made the Visual Editor's inline edit popup flicker.
