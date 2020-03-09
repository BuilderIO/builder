import React from 'react';
import { Hero } from './Hero';
import { HeroBuilderConfig } from './Hero.builder';
import { transformConfigToProps } from '@builder.io/storybook';

const props = transformConfigToProps(HeroBuilderConfig);

export default {
  title: 'Hero',
  component: Hero,
};

export const DefaultHero = () => <Hero {...props}></Hero>;
