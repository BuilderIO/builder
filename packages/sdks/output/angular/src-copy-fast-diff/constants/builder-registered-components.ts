import { componentInfo as accordionComponentInfo } from '../blocks/accordion/component-info';
import { default as Accordion } from '../blocks/accordion/index';
import { componentInfo as buttonComponentInfo } from '../blocks/button/component-info';
import { default as Button } from '../blocks/button/index';
import { componentInfo as columnsComponentInfo } from '../blocks/columns/component-info';
import { default as Columns } from '../blocks/columns/index';
import { componentInfo as fragmentComponentInfo } from '../blocks/fragment/component-info';
import { default as Fragment } from '../blocks/fragment/index';
import { componentInfo as imageComponentInfo } from '../blocks/image/component-info';
import { default as Image } from '../blocks/image/index';
import { componentInfo as sectionComponentInfo } from '../blocks/section/component-info';
import { default as Section } from '../blocks/section/index';
import { componentInfo as slotComponentInfo } from '../blocks/slot/component-info';
import { default as Slot } from '../blocks/slot/index';
import { componentInfo as symbolComponentInfo } from '../blocks/symbol/component-info';
import { default as Symbol } from '../blocks/symbol/index';
import { componentInfo as tabsComponentInfo } from '../blocks/tabs/component-info';
import { default as Tabs } from '../blocks/tabs/index';
import { componentInfo as textComponentInfo } from '../blocks/text/component-info';
import { default as Text } from '../blocks/text/index';
import type { RegisteredComponent } from '../context/types';
import { getExtraComponents } from './extra-components';
import { TARGET } from './target';

/**
 * Returns a list of all registered components.
 * NOTE: This needs to be a function to work around ESM circular dependencies.
 */
export const getDefaultRegisteredComponents: () => RegisteredComponent[] = () => [{
  component: Button,
  ...buttonComponentInfo
}, {
  component: Columns,
  ...columnsComponentInfo
}, {
  component: Fragment,
  ...fragmentComponentInfo
}, {
  component: Image,
  ...imageComponentInfo
}, {
  component: Section,
  ...sectionComponentInfo
}, {
  component: Slot,
  ...slotComponentInfo
}, {
  component: Symbol,
  ...symbolComponentInfo
}, {
  component: Text,
  ...textComponentInfo
}, ...(TARGET === 'rsc' ? [] : [{
  component: Tabs,
  ...tabsComponentInfo
}, {
  component: Accordion,
  ...accordionComponentInfo
}]), ...getExtraComponents()]