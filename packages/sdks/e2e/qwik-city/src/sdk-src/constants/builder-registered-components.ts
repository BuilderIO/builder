import { default as Button } from '../blocks/button/button';
import { componentInfo as buttonComponentInfo } from '../blocks/button/component-info.js';
import { default as Columns } from '../blocks/columns/columns';
import { componentInfo as columnsComponentInfo } from '../blocks/columns/component-info.js';
import { componentInfo as fragmentComponentInfo } from '../blocks/fragment/component-info.js';
import { default as Fragment } from '../blocks/fragment/fragment';
import { componentInfo as imageComponentInfo } from '../blocks/image/component-info.js';
import { default as Image } from '../blocks/image/image';
import { componentInfo as sectionComponentInfo } from '../blocks/section/component-info.js';
import { default as Section } from '../blocks/section/section';
import { componentInfo as symbolComponentInfo } from '../blocks/symbol/component-info.js';
import { default as Symbol } from '../blocks/symbol/symbol';
import { componentInfo as textComponentInfo } from '../blocks/text/component-info.js';
import { default as Text } from '../blocks/text/text';
import { componentInfo as videoComponentInfo } from '../blocks/video/component-info.js';
import { default as Video } from '../blocks/video/video';
import type { RegisteredComponent } from '../context/types.js';
import { componentInfo as embedComponentInfo } from '../blocks/embed/component-info.js';
import { default as embed } from '../blocks/embed/embed';
import { default as Img } from '../blocks/img/img';
import { componentInfo as imgComponentInfo } from '../blocks/img/component-info.js';
import { default as customCode } from '../blocks/custom-code/custom-code';
import { componentInfo as customCodeInfo } from '../blocks/custom-code/component-info.js';

/**
 * Returns a list of all registered components.
 * NOTE: This needs to be a function to work around ESM circular dependencies.
 */
export const getDefaultRegisteredComponents: () => RegisteredComponent[] =
  () => [
    { component: Button, ...buttonComponentInfo },
    { component: Columns, ...columnsComponentInfo },
    { component: customCode, ...customCodeInfo },
    { component: embed, ...embedComponentInfo },
    { component: Fragment, ...fragmentComponentInfo },
    { component: Image, ...imageComponentInfo },
    { component: Img, ...imgComponentInfo },
    { component: Section, ...sectionComponentInfo },
    { component: Symbol, ...symbolComponentInfo },
    { component: Text, ...textComponentInfo },
    { component: Video, ...videoComponentInfo },
  ];
