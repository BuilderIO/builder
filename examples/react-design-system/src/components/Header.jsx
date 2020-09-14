import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import { Link } from 'react-router-dom';
import builder, { BuilderComponent } from '@builder.io/react';
import { Cart } from './Cart';

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    padding: 10,
  },
  link: {
    color: '#555',
    margin: '0 10px',
  },
  logo: {
    margin: '0 auto',
    letterSpacing: 2,
    fontWeight: 600,
  },
}));

export const Header = () => {
  // Show the cart by default when editing in Builder
  const [showCart, setShowCart] = useState(builder.editingModel === 'cart-content');
  const classes = useStyles();
  return (
    <div>
      <BuilderComponent model="announcement-bar" />
      <div className={classes.header}>
        <Link to="/collections">Shop</Link>
        <div className={classes.logo}>SHOPAHOLIC</div>
        <div
          className={classes.link}
          onClick={() => {
            setShowCart(!showCart);
          }}
        >
          Cart
        </div>

        <Drawer anchor="right" open={showCart} onClose={() => setShowCart(false)}>
          <Cart />
        </Drawer>
      </div>
    </div>
  );
};
