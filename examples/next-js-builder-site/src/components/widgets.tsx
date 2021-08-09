import { Builder } from '@builder.io/react';
import dynamic from 'next/dynamic';
import { carouselConfig } from '@builder.io/widgets/dist/lib/components/Carousel.config';
import { tabsConfig } from '@builder.io/widgets/dist/lib/components/Tabs.config';
import { accordionConfig } from '@builder.io/widgets/dist/lib/components/Accordion.config';
import { masonryConfig } from '@builder.io/widgets/dist/lib/components/Masonry.config';
import { codeBlockConfig } from './code-block.config';
import { docsSearchConfig } from './docs-search.config';
import { materialTableConfig } from './material-table.config';
import { tooltipConfig } from './tooltip.config';
import { materialTabsConfig } from './material-tabs.config';
import { codeSnippetsConfig } from './code-snippets.config';

Builder.registerComponent(
  dynamic(() =>
    import('./code-block').then((res) => res.CodeBlockComponent as any),
  ),
  codeBlockConfig,
);
Builder.registerComponent(
  dynamic(() =>
    import('./code-snippets').then((res) => res.CodeSnippets as any),
  ),
  codeSnippetsConfig,
);
Builder.registerComponent(
  dynamic(() => import('./docs-search').then((res) => res.DocsSearch as any)),
  docsSearchConfig,
);
Builder.registerComponent(
  dynamic(() =>
    import('./material-table').then((res) => res.MaterialTableComponent as any),
  ),
  materialTableConfig,
);
Builder.registerComponent(
  dynamic(() =>
    import('./material-tabs').then((res) => res.MaterialTabs as any),
  ),
  materialTabsConfig,
);

Builder.registerComponent(
  dynamic(() => import('./tooltip').then((res) => res.Tooltip as any)),
  tooltipConfig as any,
);

Builder.registerComponent(
  dynamic(() =>
    import('@builder.io/widgets/dist/lib/components/Carousel').then(
      (mod) => mod.CarouselComponent,
    ),
  ),
  carouselConfig,
);
Builder.registerComponent(
  dynamic(() =>
    import('@builder.io/widgets/dist/lib/components/Tabs').then(
      (mod) => mod.TabsComponent,
    ),
  ),
  tabsConfig,
);
Builder.registerComponent(
  dynamic(() =>
    import('@builder.io/widgets/dist/lib/components/Accordion').then(
      (mod) => mod.AccordionComponent,
    ),
  ),
  accordionConfig,
);
Builder.registerComponent(
  dynamic(() =>
    import('@builder.io/widgets/dist/lib/components/Masonry').then(
      (mod) => mod.MasonryComponent,
    ),
  ),
  masonryConfig,
);
