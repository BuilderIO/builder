/**
 *  src/custom-components.ts
 */

import { RegisteredComponent } from '@builder.io/sdk-react';
import { customColumnsInfo } from './components/customColumnsInfo';
import { customHeroInfo } from './components/customHeroInfo';
import { customTabsInfo } from './components/customTabsInfo';

export const customComponents: RegisteredComponent[] = [
  customColumnsInfo,
  customHeroInfo,
  customTabsInfo,
];
