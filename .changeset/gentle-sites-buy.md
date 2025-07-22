---
"@builder.io/utils": patch
---

Fix null pointer error in getTranslateableFields when processing Symbol components with null or empty values

Fixed "Cannot read properties of null (reading '@type')" error that occurred when `getTranslateableFields` processed Symbol components containing null values or empty arrays in their data. The function now properly checks for null values before attempting to access object properties.

**What changed:**
- Added null checks in `recordValue` and `resolveTranslation` functions before accessing `@type` property
- Symbol components with empty arrays or null values in their data now process without errors

**Why this was needed:**
- In JavaScript, `typeof null === 'object'` but `null['@type']` throws an error
- Symbol components can have empty arrays or null values in their data that were causing crashes

**Impact:**
- This is a bug fix with no breaking changes
- Content with Symbol components containing empty or null data will now process correctly
- No code changes required for consumers
