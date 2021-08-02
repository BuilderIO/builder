import { isEditing } from './src/functions/is-editing';

if (isEditing()) {
  import('./src/scripts/init-editing');
}

// TODO: lazy option
export { default as Columns } from './src/blocks/columns';
export { default as Image } from './src/blocks/image';
export { default as Text } from './src/blocks/text';
export { default as RenderContent } from './src/components/render-content';
