import RawText from '../../blocks/raw-text.lite';
import { registerComponent } from '../../functions/register-component';

registerComponent(RawText, {
  name: 'Builder:RawText',
  hideFromInsertMenu: true,
  builtIn: true,
  inputs: [
    {
      name: 'text',
      bubble: true,
      type: 'longText',
      required: true,
    },
  ],
});
