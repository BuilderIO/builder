import { isEditing } from './functions/is-editing';

if (isEditing()) {
  import('./scripts/init-editing');
}

// TODO: lazy option
export * from './blocks/columns.lite'
export * from './blocks/image.lite'
export * from './blocks/text.lite'
export * from './components/render-content.lite'