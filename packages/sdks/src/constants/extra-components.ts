/**
 * These are in a separate file because React Native does not support them (yet).
 * Having them in a separate file allows us to override it to be empty in the
 * React Native SDK.
 */

import { componentInfo as customCodeInfo } from '../blocks/custom-code/component-info.js';
import { default as customCode } from '../blocks/custom-code/custom-code.lite.jsx';
import { componentInfo as embedComponentInfo } from '../blocks/embed/component-info.js';
import { default as embed } from '../blocks/embed/embed.lite.jsx';
import { componentInfo as imgComponentInfo } from '../blocks/img/component-info.js';
import { default as Img } from '../blocks/img/img.lite.jsx';
import { componentInfo as videoComponentInfo } from '../blocks/video/component-info.js';
import { default as Video } from '../blocks/video/video.lite.jsx';
import type { RegisteredComponent } from '../context/types.js';

export const getExtraComponents: () => RegisteredComponent[] = () => [
  { component: Video, ...videoComponentInfo },
  { component: customCode, ...customCodeInfo },
  { component: embed, ...embedComponentInfo },
  { component: Img, ...imgComponentInfo },
];
