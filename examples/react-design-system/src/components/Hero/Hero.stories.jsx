import React from 'react';
import { Hero } from './Hero';
import { HeroBuilderConfig } from './Hero.builder';
import { builderDecorator, transformConfigToProps } from '@builder.io/storybook';

const props = transformConfigToProps(HeroBuilderConfig);

export default {
  title: 'Hero',
  component: Hero,
  decorators: [builderDecorator],
};

export const DefaultHero = () => <Hero {...props}></Hero>;
