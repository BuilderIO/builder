import React from 'react';
import { Review } from './Review';
import { ReviewBuilderConfig } from './Review.builder';
import { getDefaultProps } from '@builder.io/storybook';

const props = getDefaultProps(ReviewBuilderConfig);

export default {
  title: 'Review',
  component: Review,
  parameters: {
    builder: {
      config: ReviewBuilderConfig,
    },
  },
};

export const DefaultReview = () => <Review {...props}></Review>;
