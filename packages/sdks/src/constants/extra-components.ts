/**
 * These are in a separate file because React Native does not support them (yet).
 * Having them in a separate file allows us to override it to be empty in the
 * React Native SDK.
 */

import { componentInfo as customCodeInfo } from '../blocks/custom-code/component-info.js';
import { default as customCode } from '../blocks/custom-code/custom-code.lite.jsx';
import { componentInfo as embedComponentInfo } from '../blocks/embed/component-info.js';
import { default as embed } from '../blocks/embed/embed.lite.jsx';
import { componentInfo as formComponentInfo } from '../blocks/form/form/component-info.js';
import { default as Form } from '../blocks/form/form/form.lite.jsx';
import { componentInfo as formInputComponentInfo } from '../blocks/form/input/component-info.js';
import { default as FormInput } from '../blocks/form/input/input.lite.jsx';
import { componentInfo as formSelectComponentInfo } from '../blocks/form/select/component-info.js';
import { default as FormSelect } from '../blocks/form/select/select.lite.jsx';
import { componentInfo as formSubmitButtonComponentInfo } from '../blocks/form/submit-button/component-info.js';
import { default as FormSubmitButton } from '../blocks/form/submit-button/submit-button.lite.jsx';
import { componentInfo as imgComponentInfo } from '../blocks/img/component-info.js';
import { default as Img } from '../blocks/img/img.lite.jsx';
import { componentInfo as videoComponentInfo } from '../blocks/video/component-info.js';
import { default as Video } from '../blocks/video/video.lite.jsx';
import type { RegisteredComponent } from '../context/types.js';
import { TARGET } from './target.js';

export const getExtraComponents: () => RegisteredComponent[] = () => [
  { component: customCode, ...customCodeInfo },
  { component: embed, ...embedComponentInfo },
  ...(TARGET === 'rsc'
    ? []
    : [
        { component: Form, ...formComponentInfo },
        { component: FormInput, ...formInputComponentInfo },
        { component: FormSubmitButton, ...formSubmitButtonComponentInfo },
        { component: FormSelect, ...formSelectComponentInfo },
      ]),
  { component: Img, ...imgComponentInfo },
  { component: Video, ...videoComponentInfo },
];
