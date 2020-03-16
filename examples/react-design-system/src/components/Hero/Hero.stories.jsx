import React from 'react';
import { Hero } from './Hero';
import { HeroBuilderConfig } from './Hero.builder';
import { getDefaultProps } from '@builder.io/storybook';
import Typography from '@material-ui/core/Typography';

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

export const DefaultHero = () => (
  <div>
    <Typography align="center" variant="subtitle1">
      Double click to edit
    </Typography>
    <Hero {...props}></Hero>
  </div>
);
