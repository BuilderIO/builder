import React from 'react';
import { Hero } from './Hero';
import { HeroBuilderConfig } from './Hero.builder';
import { getDefaultProps } from '@builder.io/storybook';

const props = getDefaultProps(HeroBuilderConfig);

export default {
  title: 'Hero',
  component: Hero,
};

export const DefaultHero = () => <Hero {...props}></Hero>;
