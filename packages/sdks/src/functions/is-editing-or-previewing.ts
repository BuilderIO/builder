import { isEditing } from './is-editing.js';
import { isPreviewing } from './is-previewing.js';

export const isEditingOrPreviewing = () => isEditing() || isPreviewing();
