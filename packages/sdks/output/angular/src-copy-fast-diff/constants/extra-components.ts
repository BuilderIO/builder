/**
 * These are in a separate file because React Native does not support them (yet).
 * Having them in a separate file allows us to override it to be empty in the
 * React Native SDK.
 */

import { componentInfo as customCodeInfo } from '../blocks/custom-code/component-info';
import { default as customCode } from '../blocks/custom-code/index';
import { componentInfo as embedComponentInfo } from '../blocks/embed/component-info';
import { default as embed } from '../blocks/embed/index';
import { componentInfo as formComponentInfo } from '../blocks/form/form/component-info';
import { default as Form } from '../blocks/form/form/index';
import { componentInfo as formInputComponentInfo } from '../blocks/form/input/component-info';
import { default as FormInput } from '../blocks/form/input/index';
import { componentInfo as formSelectComponentInfo } from '../blocks/form/select/component-info';
import { default as FormSelect } from '../blocks/form/select/index';
import { componentInfo as formSubmitButtonComponentInfo } from '../blocks/form/submit-button/component-info';
import { default as FormSubmitButton } from '../blocks/form/submit-button/index';
import { componentInfo as textAreaComponentInfo } from '../blocks/form/textarea/component-info';
import { default as Textarea } from '../blocks/form/textarea/index';
import { componentInfo as imgComponentInfo } from '../blocks/img/component-info';
import { default as Img } from '../blocks/img/index';
import { componentInfo as videoComponentInfo } from '../blocks/video/component-info';
import { default as Video } from '../blocks/video/index';
import type { RegisteredComponent } from '../context/types';
import { TARGET } from './target';
export const getExtraComponents: () => RegisteredComponent[] = () => [{
  component: customCode,
  ...customCodeInfo
}, {
  component: embed,
  ...embedComponentInfo
}, ...(TARGET === 'rsc' ? [] : [{
  component: Form,
  ...formComponentInfo
}, {
  component: FormInput,
  ...formInputComponentInfo
}, {
  component: FormSubmitButton,
  ...formSubmitButtonComponentInfo
}, {
  component: FormSelect,
  ...formSelectComponentInfo
}, {
  component: Textarea,
  ...textAreaComponentInfo
}]), {
  component: Img,
  ...imgComponentInfo
}, {
  component: Video,
  ...videoComponentInfo
}]