import('./index-helpers/top-of-file');

import { isEditing } from './functions/is-editing';

if (isEditing()) {
  import('./scripts/init-editing');
}

export * from './index-helpers/blocks-exports';

export * from './functions/is-editing';
export * from './functions/register-component';
export * from './functions/register';
export * from './functions/set-editor-settings';
export * from './functions/get-content';
export * from './functions/get-builder-search-params';
