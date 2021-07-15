import { isEditing } from './functions/is-editing';

if (isEditing()) {
  import('./scripts/init-editing');
}
