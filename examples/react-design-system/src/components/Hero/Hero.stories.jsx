import React from 'react';
import { Hero } from './Hero';
import { HeroBuilderConfig } from './Hero.builder';
import { getDefaultProps } from '@builder.io/storybook';

const props = getDefaultProps(HeroBuilderConfig);

export default {
  title: 'Hero',
  component: Hero,
  parameters: {
    builder: {
      config: HeroBuilderConfig,
    },
  },
};

export const DefaultHero = () => <Hero {...props}></Hero>;
