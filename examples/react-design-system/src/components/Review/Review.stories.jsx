import React from 'react';
import { Review } from './Review';
import { ReviewBuilderConfig } from './Review.builder';
import { builderDecorator, transformConfigToProps } from '@builder.io/storybook';

const props = transformConfigToProps(ReviewBuilderConfig);

export default {
  title: 'Review',
  component: Review,
  decorators: [builderDecorator],
};

export const DefaultReview = () => <Review {...props}></Review>;
