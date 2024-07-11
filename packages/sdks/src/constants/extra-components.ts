/**
 * These are in a separate file because React Native does not support them (yet).
 * Having them in a separate file allows us to override it to be empty in the
 * React Native SDK.
 */

import { componentInfo as customCodeInfo } from '../blocks/custom-code/component-info.js';
import { default as customCode } from '../blocks/custom-code/index.js';
import { componentInfo as embedComponentInfo } from '../blocks/embed/component-info.js';
import { default as embed } from '../blocks/embed/index.js';
import { componentInfo as formComponentInfo } from '../blocks/form/form/component-info.js';
import { default as Form } from '../blocks/form/form/index.js';
import { componentInfo as formInputComponentInfo } from '../blocks/form/input/component-info.js';
import { default as FormInput } from '../blocks/form/input/index.js';
import { componentInfo as formSelectComponentInfo } from '../blocks/form/select/component-info.js';
import { default as FormSelect } from '../blocks/form/select/index.js';
import { componentInfo as formSubmitButtonComponentInfo } from '../blocks/form/submit-button/component-info.js';
import { default as FormSubmitButton } from '../blocks/form/submit-button/index.js';
import { componentInfo as textAreaComponentInfo } from '../blocks/form/textarea/component-info.js';
import { default as Textarea } from '../blocks/form/textarea/index.js';
import { componentInfo as imgComponentInfo } from '../blocks/img/component-info.js';
import { default as Img } from '../blocks/img/index.js';
import { componentInfo as videoComponentInfo } from '../blocks/video/component-info.js';
import { default as Video } from '../blocks/video/index.js';
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
        { component: Textarea, ...textAreaComponentInfo },
      ]),
  { component: Img, ...imgComponentInfo },
  { component: Video, ...videoComponentInfo },
];
