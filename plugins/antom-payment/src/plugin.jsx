/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Builder } from '@builder.io/react';
import pkg from '../package.json';
import AntomEditTab from './components/AntomEditTab';

const PLUGIN_ID = pkg.name;

// Stable identity; no settings registration, access, persistence or automatic dialog.
// Previously saved Space values remain untouched and are no longer consumed.
Builder.register('plugin', { name: 'Antom Skills', id: PLUGIN_ID });
Builder.register('editor.editTab', { name: 'Antom', component: () => <AntomEditTab /> });

export { PLUGIN_ID };
export default { PLUGIN_ID };
