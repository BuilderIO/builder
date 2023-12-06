/* eslint-disable react/prop-types */
import React from 'react';
import { Image } from '@builder.io/react';
import { Parallax, Background } from 'react-parallax';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const Hero = props => {
  const { image, title, parallaxStrength, buttonLink, buttonText, height, darkMode } = props;

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
        <Button style={{ color: darkMode ? 'gray' : 'white' }} variant="outlined" href={buttonLink}>
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

export default Hero;
