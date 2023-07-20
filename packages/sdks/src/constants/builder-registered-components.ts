import { default as Button } from '../blocks/button/button.lite';
import { componentInfo as buttonComponentInfo } from '../blocks/button/component-info';
import { default as Columns } from '../blocks/columns/columns.lite';
import { componentInfo as columnsComponentInfo } from '../blocks/columns/component-info';
import { componentInfo as fragmentComponentInfo } from '../blocks/fragment/component-info';
import { default as Fragment } from '../blocks/fragment/fragment.lite';
import { componentInfo as imageComponentInfo } from '../blocks/image/component-info';
import { default as Image } from '../blocks/image/image.lite';
import { componentInfo as sectionComponentInfo } from '../blocks/section/component-info';
import { default as Section } from '../blocks/section/section.lite';
import { componentInfo as symbolComponentInfo } from '../blocks/symbol/component-info';
import { default as Symbol } from '../blocks/symbol/symbol.lite';
import { componentInfo as textComponentInfo } from '../blocks/text/component-info';
import { default as Text } from '../blocks/text/text.lite';
import { componentInfo as videoComponentInfo } from '../blocks/video/component-info';
import { default as Video } from '../blocks/video/video.lite';
import type { RegisteredComponent } from '../context/types';
import { componentInfo as embedComponentInfo } from '../blocks/embed/component-info';
import { default as embed } from '../blocks/embed/embed.lite';
import { default as Img } from '../blocks/img/img.lite';
import { componentInfo as imgComponentInfo } from '../blocks/img/component-info';
import { default as customCode } from '../blocks/custom-code/custom-code.lite';
import { componentInfo as customCodeInfo } from '../blocks/custom-code/component-info';

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
