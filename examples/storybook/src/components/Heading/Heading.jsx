import React from 'react';
import Typography from '@material-ui/core/Typography';

export const Heading = props => {
  const { text, type } = props;

  return <Typography variant={type || 'h2'}>{text}</Typography>;
};
