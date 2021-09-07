import { isEditing } from './functions/is-editing';

if (isEditing()) {
  import('./scripts/init-editing');
}

// TODO: way to make a nuxt-only override
export * from './functions/register-component';
export * from './functions/register';
export * from './functions/set-editor-settings';
export * from './functions/get-content';
