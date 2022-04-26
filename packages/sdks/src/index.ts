// TO-DO: this seems to cause issues with `vue`. `import()` does not get converted to require, and is not being parsed
// properly.
import './index-helpers/top-of-file';

// register all Builder components
import './index-helpers/register-components';

import './scripts/init-editing';

export * from './index-helpers/blocks-exports';

export * from './functions/is-editing';
export * from './functions/is-previewing';
export * from './functions/register-component';
export * from './functions/register';
export * from './functions/set-editor-settings';
export * from './functions/get-content';
export * from './functions/get-builder-search-params';
