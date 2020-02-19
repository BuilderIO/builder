import React from 'react';
import { Parallax } from 'react-parallax';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

export const Hero = props => {
  const { image, title, parallaxStrength, buttonLink, buttonText, height, darkMode } = props;

  return (
    <Parallax
      style={{ height }}
      blur={{ min: -20, max: 20 }}
      bgImage={image}
      bgImageAlt={title}
      strength={parallaxStrength}
    >
      <Box
        style={{ color: darkMode ? 'gray' : 'white' }}
        textAlign="center"
        paddingTop={`calc(${height}/3)`}
      >
        <Typography variant="h2">{title}</Typography>
        <Button style={{ color: darkMode ? 'gray' : 'white' }} variant="outlined" href={buttonLink}>
          {buttonText}
        </Button>
      </Box>
    </Parallax>
  );
};
