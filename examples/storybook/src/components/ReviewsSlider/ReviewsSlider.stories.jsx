import React from 'react';
import { ReviewsSlider } from './ReviewsSlider';
import { ReviewsSliderBuilderConfig } from './ReviewsSlider.builder';
import { getDefaultProps } from '@builder.io/storybook';
const props = getDefaultProps(ReviewsSliderBuilderConfig);

export default {
  title: 'Reviews Slider',
  component: ReviewsSlider,
  parameters: {
    builder: {
      config: ReviewsSliderBuilderConfig,
    },
  },
};

export const DefaultReviewsSlider = () => <ReviewsSlider {...props}></ReviewsSlider>;
