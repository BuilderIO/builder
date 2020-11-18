import { Builder } from '@builder.io/react';

import { CarouselComponent } from './components/Carousel';
import { TabsComponent } from './components/Tabs';
import { AccordionComponent } from './components/Accordion';
import { MasonryComponent } from './components/Masonry';
import { carouselConfig } from './components/Carousel.config';
import { tabsConfig } from './components/Tabs.config';
import { accordionConfig } from './components/Accordion.config';
import { masonryConfig } from './components/Masonry.config';

Builder.registerComponent(CarouselComponent, carouselConfig);
Builder.registerComponent(TabsComponent, tabsConfig);
Builder.registerComponent(AccordionComponent, accordionConfig);
Builder.registerComponent(MasonryComponent, masonryConfig);
