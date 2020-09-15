import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  link: {
    color: '#555',
    margin: '0 10px',
  },
  footer: {
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'center',
    fontSize: 12,
    padding: 20,
  },
}));

export const Footer = () => {
  const classes = useStyles();
  return (
    <div className={classes.footer}>
      <div className={classes.link}>Shop</div>
      <div className={classes.link}>About</div>
      <div className={classes.link}>Cart</div>
      <div className={classes.link}>Account</div>
      <div className={classes.link}>Privacy</div>
      <div className={classes.link}>Terms</div>
    </div>
  );
};
