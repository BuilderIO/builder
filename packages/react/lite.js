/**
 * To use the lite build:
 *
 *    // Change all imports from '@builder.io/react' to '@builder.io/react/lite'
 *    import { BuilderComponent } from '@builder.io/react/lite';
 *
 *    // Import only what built-in components you like
 *    import '@builder.io/react/dist/lib/src/blocks/Button';
 *    import '@builder.io/react/dist/lib/src/blocks/Columns';
 *
 *
 * You should generally use this in conjunction with `customInsertMenu` moe, e.g.:
 *    Builder.set({ customInsertMenu: true });
 * to ensure that no components are displayed that aren't imported
 *
 *
 * E.g. github.com/BuilderIO/builder/blob/master/examples/react-design-system/src/builder-settings.js#L9:L9
 *
 */
module.exports = require('./dist/builder-react-lite.cjs.js');
