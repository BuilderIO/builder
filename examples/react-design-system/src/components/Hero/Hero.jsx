import React from 'react';
import { Parallax } from 'react-parallax';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

export const Hero = props => {
  const { children, image, title, strength, buttonLink, buttonText, height } = props;
  const child = children || (
    <Box textAlign="center" paddingTop={`calc(${height}/3)`}>
      <Typography color="textSecondary" variant="h2">
        {title}
      </Typography>
      <Button variant="contained" href={buttonLink} color="primary">
        {buttonText}
      </Button>
    </Box>
  );

  return (
    <Parallax
      style={{ height }}
      blur={{ min: -20, max: 20 }}
      bgImage={image}
      bgImageAlt={title}
      strength={strength}
    >
      {child}
    </Parallax>
  );
};
