import { isEditing } from './functions/is-editing';

if (isEditing()) {
  import('./scripts/init-editing');
}

// TODO: lazy option
export { default as Columns } from './blocks/columns.lite';
export { default as Image } from './blocks/image.lite';
export { default as Text } from './blocks/text.lite';
export { default as RenderContent } from './components/render-content.lite';
export * from './functions/register-component';
