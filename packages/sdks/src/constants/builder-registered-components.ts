import { componentInfo as accordionComponentInfo } from '../blocks/accordion/component-info.js';
import { default as Accordion } from '../blocks/accordion/index.js';
import { componentInfo as buttonComponentInfo } from '../blocks/button/component-info.js';
import { default as Button } from '../blocks/button/index.js';
import { componentInfo as columnsComponentInfo } from '../blocks/columns/component-info.js';
import { default as Columns } from '../blocks/columns/index.js';
import { componentInfo as fragmentComponentInfo } from '../blocks/fragment/component-info.js';
import { default as Fragment } from '../blocks/fragment/index.js';
import { componentInfo as imageComponentInfo } from '../blocks/image/component-info.js';
import { default as Image } from '../blocks/image/index.js';
import { componentInfo as sectionComponentInfo } from '../blocks/section/component-info.js';
import { default as Section } from '../blocks/section/index.js';
import { componentInfo as slotComponentInfo } from '../blocks/slot/component-info.js';
import { default as Slot } from '../blocks/slot/index.js';
import { componentInfo as symbolComponentInfo } from '../blocks/symbol/component-info.js';
import { default as Symbol } from '../blocks/symbol/index.js';
import { componentInfo as tabsComponentInfo } from '../blocks/tabs/component-info.js';
import { default as Tabs } from '../blocks/tabs/index.js';
import { componentInfo as textComponentInfo } from '../blocks/text/component-info.js';
import { default as Text } from '../blocks/text/index.js';
import type { RegisteredComponent } from '../context/types.js';
import { getExtraComponents } from './extra-components.js';
import { TARGET } from './target.js';

/**
 * Returns a list of all registered components.
 * NOTE: This needs to be a function to work around ESM circular dependencies.
 */
export const getDefaultRegisteredComponents: () => RegisteredComponent[] =
  () => [
    { component: Button, ...buttonComponentInfo },
    { component: Columns, ...columnsComponentInfo },
    { component: Fragment, ...fragmentComponentInfo },
    { component: Image, ...imageComponentInfo },
    { component: Section, ...sectionComponentInfo },
    { component: Slot, ...slotComponentInfo },
    { component: Symbol, ...symbolComponentInfo },
    { component: Text, ...textComponentInfo },
    ...(TARGET === 'rsc'
      ? []
      : [
          { component: Tabs, ...tabsComponentInfo },
          { component: Accordion, ...accordionComponentInfo },
        ]),
    ...getExtraComponents(),
  ];
