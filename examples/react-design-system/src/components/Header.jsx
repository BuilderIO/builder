import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import { Link } from 'react-router-dom';
import builder, { BuilderComponent, BuilderContent } from '@builder.io/react';
import { Cart } from './Cart';

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    padding: 20,
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
        <BuilderContent modelName="header-nav-links">
          {(data, loading) => (
            <div style={{ display: 'flex' }}>
              {data?.links?.map((item, index) => (
                <div key={index} style={{ marginRight: 15 }}>
                  <Link to={item.link}>{item.text}</Link>
                </div>
              ))}
            </div>
          )}
        </BuilderContent>

        <Link to="/" className={classes.logo}>
          SHOPAHOLIC
        </Link>
        <a
          className={classes.link}
          onClick={() => {
            setShowCart(!showCart);
          }}
        >
          Cart
        </a>

        <Drawer anchor="right" open={showCart} onClose={() => setShowCart(false)}>
          <Cart />
        </Drawer>
      </div>
    </div>
  );
};
