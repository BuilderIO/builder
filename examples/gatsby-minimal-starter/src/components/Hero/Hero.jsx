/* eslint-disable react/prop-types */
import React from 'react';
import { Image } from '@builder.io/react';
import { Parallax, Background } from 'react-parallax';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

export const Hero = (props) => {
  const {
    image,
    title,
    parallaxStrength,
    buttonLink,
    buttonText,
    height,
    darkMode
  } = props;

  return (
    <Parallax
      style={{ height }}
      blur={{ min: -20, max: 20 }}
      bgImageAlt={title}
      strength={parallaxStrength}
    >
      <Box
        style={{ color: darkMode ? 'gray' : 'white' }}
        textAlign="center"
        paddingTop={`calc(${height}px/3)`}
      >
        <Typography variant="h2">{title}</Typography>
        <Button
          style={{ color: darkMode ? 'gray' : 'white' }}
          variant="outlined"
          href={buttonLink}
        >
          {buttonText}
        </Button>
      </Box>
      <Background className="custom-bg">
        {/* Builder optimized image with srcset, lazy, etc */}
        <Image src={image} alt="builder-optimized-example" />
      </Background>
    </Parallax>
  );
};
