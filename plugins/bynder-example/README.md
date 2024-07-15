Bynder Plugin integration for Builder.

### Notes
This is a starting point, not a complete integration. 
* The current output is the full Bynder file information object. This may or may not meet your needs.
* The plugin's main setup is configured in the `plugin.jsx` file. 
* UI elements that handle loading the Bynder-provided Universal Compact View asset selector, and rendering the result as a preview in the `ui.jsx` file.
* Simple utils in `utils.js`, largely CONSTS for consistency between files.
* Bynder's docs can be found (here)[https://developer-docs.bynder.com/ui-components], and their React-specific code docs (here)[https://www.npmjs.com/package/@bynder/compact-view]

## Odd bug:
* Passing in the currently selected value does not appear to maintain the selection, despite passing in the assetID that Bynder's docs show.

## Rainy Day Task List:
* Convert to Typescript
* Migrate to Rollup
* Create & implement a multi-image select handler
* Per-instance file-type inputs like Builder's file input component

## Idea: Builder Input replacement
If completely replacing access to the Builder file input component is desired, you would need to do the following:
* Change the name key from `"BynderSingleSelect"` to `"file"` when calling `Builder.registerEditor()`
* Ensure that the only values being saved in the onChange are the final URL of the image, matching the Builder file input type's format. 
* This could also be done as a toggle, conditionally changing the plugin's name from one to the other.