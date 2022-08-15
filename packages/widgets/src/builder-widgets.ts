import loadable from '@loadable/component';
import { Builder } from '@builder.io/react';

import { carouselConfig } from './components/Carousel.config';
import { tabsConfig } from './components/Tabs.config';
import { accordionConfig } from './components/Accordion.config';
import { masonryConfig } from './components/Masonry.config';

Builder.registerComponent(
  loadable(() => import('./components/Carousel').then(mod => mod.CarouselComponent as any)),
  carouselConfig
);
Builder.registerComponent(
  loadable(() => import('./components/Tabs').then(mod => mod.TabsComponent as any)),
  tabsConfig
);
Builder.registerComponent(
  loadable(() => import('./components/Accordion').then(mod => mod.AccordionComponent as any)),
  accordionConfig
);
Builder.registerComponent(
  loadable(() => import('./components/Masonry').then(mod => mod.MasonryComponent as any)),
  masonryConfig
);
