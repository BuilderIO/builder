import React, { Component } from 'react';
import Slider from 'react-slick';
import { Review } from '../Review/Review';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export const ReviewsSlider = props => {
  const { dots, infinite, reviews } = props;
  const settings = {
    dots,
    infinite,
    speed: 400,
    slidesToShow: 1,
    autoplay: true,
  };

  return (
    <Slider {...settings}>
      {reviews.map(review => (
        <Review {...review} />
      ))}
    </Slider>
  );
};
