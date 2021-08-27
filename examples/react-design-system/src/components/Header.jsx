import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Menu from '@material-ui/icons/Menu'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import CartIcon from '@material-ui/icons/ShoppingBasket'
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
    position: 'absolute',
    width: 300,
    top: 55,
    left: 0,
    right: 0,
    textAlign: 'center'
  },
}));

export const Header = () => {
  // Show the cart by default when editing in Builder
  const [showCart, setShowCart] = useState(builder.editingModel === 'cart-content');
  const [showMenu, setShowMenu] = useState(builder.editingModel === 'header-nav-links');
  const [expandedNavItem, setExpandedNavItem] = useState(null);
  const classes = useStyles();
  return (
    <div>
      <BuilderComponent model="announcement-bar" />
      <div className={classes.header}>
        <a
          className={classes.link}
          onClick={() => {
            setShowMenu(!showCart);
          }}
        >
          <Menu />
        </a>

        <Drawer anchor="left" open={showMenu} onClose={() => setShowMenu(false)}>
          <BuilderContent modelName="header-nav-links">
              {(data, loading) => (
                <div style={{ width: 380, maxWidth: '90vw' }}>
                  {data?.links?.map((item, index) => (
                    <div key={index} style={{ fontFamily: 'Avenir', letterSpacing: 2.17, borderBottom: '1px solid #eaeef5', textAlign: 'center' }}>
                      {/* <Link to={item.link}>{item.text}</Link> */}
                      <div 
                        style={{ fontWeight: expandedNavItem === index ? 'bold' : undefined, padding: 20, }}
                        onClick={() => {
                          if (expandedNavItem === index) {
                            setExpandedNavItem(null)
                          } else {
                            setExpandedNavItem(index)
                          }
                        }}>
                        {item.text}
                      </div>
                      <Drawer anchor="left" open={expandedNavItem === index} onClose={() => setExpandedNavItem(null)}>
                        <div style={{ width: 380, maxWidth: '90vw' }}>
                          <div style={{ position: 'relative', padding: 20, fontFamily: 'Avenir', fontWeight: 'bold', background: '#eaeef5', letterSpacing: 2.17, borderBottom: '1px solid #eaeef5', textAlign: 'center' }}>
                            <ChevronLeft style={{ position: 'absolute', left: 17, top: 17, fontSize: 30 }} onClick={() => setExpandedNavItem(null)} />
                            {item.text}
                          </div>
                          <div>
                            {item.subMenu?.menuItems?.map((subItem, index) => {
                              return <div key={index} style={{ padding: 20, fontFamily: 'Avenir', letterSpacing: 2.17, borderBottom: '1px solid #eaeef5', textAlign: 'center' }}>
                                <Link onClick={() => {
                                  setExpandedNavItem(null)
                                  setShowMenu(null)
                                }} to={subItem.link}>{subItem.text}</Link>
                              </div>
                            })}
                          </div>
                          <img src={item.subMenu?.featuredImage} style={{width: '100%'}} />
                        </div>
                      </Drawer>
                    </div>
                  ))}
                </div>
              )}
          </BuilderContent>
        </Drawer>
        
        <Link to="/" className={classes.logo}>
          <img style={{ height: 40 }} src="https://jamesavery-productionv3-weblinc.netdna-ssl.com/assets/workarea/storefront/logo-a352408084bba6d78441a5478f6f0603d426d3170e4616432c05e39f9abefe02.svg" />
        </Link>

        <a
          style={{ marginLeft: 'auto' }}
          className={classes.link}
          onClick={() => {
            setShowCart(!showCart);
          }}
        >
          <CartIcon />
        </a>

        <Drawer anchor="right" open={showCart} onClose={() => setShowCart(false)}>
          <Cart />
        </Drawer>
      </div>
    </div>
  );
};
