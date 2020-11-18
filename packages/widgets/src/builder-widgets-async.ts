import { lazy } from 'react';
import { Builder } from '@builder.io/react';

import { carouselConfig } from './components/Carousel.config';
import { tabsConfig } from './components/Tabs.config';
import { accordionConfig } from './components/Accordion.config';
import { masonryConfig } from './components/Masonry.config';

Builder.registerComponent(
  lazy(() => import('./components/Carousel').then(mod => ({ default: mod.CarouselComponent }))),
  carouselConfig
);
Builder.registerComponent(
  lazy(() => import('./components/Tabs').then(mod => ({ default: mod.TabsComponent }))),
  tabsConfig
);
Builder.registerComponent(
  lazy(() => import('./components/Accordion').then(mod => ({ default: mod.AccordionComponent }))),
  accordionConfig
);
Builder.registerComponent(
  lazy(() => import('./components/Masonry').then(mod => ({ default: mod.MasonryComponent }))),
  masonryConfig
);
