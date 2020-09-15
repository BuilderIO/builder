import React from 'react';
import MuiButon from '@material-ui/core/Button';

export const Button = props => {
  const { text, link, type } = props;

  return (
    <MuiButon variant={type || 'outlined'} href={link}>
      {text}
    </MuiButon>
  );
};
