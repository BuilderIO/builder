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
// import { componentInfo as videoComponentInfo } from '../blocks/video/component-info';
// import { default as Video } from '../blocks/video/video.lite';
import type { RegisteredComponent } from '../context/builder.context.lite';

/**
 * Returns a list of all registered components.
 * NOTE: This needs to be a function to work around ESM circular dependencies.
 */
export const getDefaultRegisteredComponents: () => RegisteredComponent[] =
  () => [
    { component: Columns, ...columnsComponentInfo },
    { component: Image, ...imageComponentInfo },
    { component: Text, ...textComponentInfo },
    // TO-DO: This file breaks due to this issue:
    // https://github.com/expo/web-examples/issues/73
    // For now, we do not import it elsewhere to avoid crashing Expo servers on web when importing the SDK.
    // { component: Video, ...videoComponentInfo },
    { component: Symbol, ...symbolComponentInfo },
    { component: Button, ...buttonComponentInfo },
    { component: Section, ...sectionComponentInfo },
    { component: Fragment, ...fragmentComponentInfo },
  ];
