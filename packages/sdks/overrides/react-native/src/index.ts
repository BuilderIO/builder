// This override exists to omit the Video export from react-native, which currently causes issues.

import { isEditing } from './functions/is-editing';

if (isEditing()) {
  import('./scripts/init-editing');
}

export { default as Columns } from './blocks/columns.lite';
export { default as Image } from './blocks/image.lite';
export { default as Text } from './blocks/text.lite';
export { default as Symbol } from './blocks/symbol.lite';
export { default as Section } from './blocks/section.lite';
export { default as Fragment } from './blocks/fragment.lite';
export { default as RenderContent } from './components/render-content.lite';

export * from './functions/is-editing';
export * from './functions/register-component';
export * from './functions/register';
export * from './functions/set-editor-settings';
export * from './functions/get-content';
