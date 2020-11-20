import React from 'react';
import { ComponentType, lazy, Suspense } from 'react';
import { Builder } from '@builder.io/react';

import { carouselConfig } from './components/Carousel.config';
import { tabsConfig } from './components/Tabs.config';
import { accordionConfig } from './components/Accordion.config';
import { masonryConfig } from './components/Masonry.config';

const lazyComponent = <T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) => {
  const LazyComponent = lazy(factory);

  return (props: any) => (
    <Suspense fallback={<></>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

Builder.registerComponent(
  lazyComponent(() =>
    import('./components/Carousel').then(mod => ({ default: mod.CarouselComponent }))
  ),
  carouselConfig
);
Builder.registerComponent(
  lazyComponent(() => import('./components/Tabs').then(mod => ({ default: mod.TabsComponent }))),
  tabsConfig
);
Builder.registerComponent(
  lazyComponent(() =>
    import('./components/Accordion').then(mod => ({ default: mod.AccordionComponent }))
  ),
  accordionConfig
);
Builder.registerComponent(
  lazyComponent(() =>
    import('./components/Masonry').then(mod => ({ default: mod.MasonryComponent }))
  ),
  masonryConfig
);
