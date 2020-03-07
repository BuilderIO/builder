import React from 'react';
import { ReviewsSlider } from './ReviewsSlider';
import { ReviewsSliderBuilderConfig } from './ReviewsSlider.builder';
import { builderDecorator, transformConfigToProps } from '@builder.io/storybook';
const props = transformConfigToProps(ReviewsSliderBuilderConfig);

export default {
  title: 'Reviews Slider',
  component: ReviewsSlider,
  decorators: [builderDecorator],
};

export const DefaultReviewsSlider = () => <ReviewsSlider {...props}></ReviewsSlider>;
