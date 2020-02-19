import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BuilderComponent, builder, Builder } from '@builder.io/react';
import { makeStyles } from '@material-ui/core/styles';
import './index.css';
import './builder-settings';

// Be sure to import all of your components where you use <BuilderComponent /> so they are
// bundled and accessable
import './components/ProductsList/ProductsList.builder';
import './components/Hero/Hero.builder';
import './components/TripleColumns/TripleColumns.builder';
import './components/DoubleColumns/DoubleColumns.builder';
import './components/Review/Review.builder';
import './components/ReviewsSlider/ReviewsSlider.builder';
import './components/Button/Button.builder';
import './components/Heading/Heading.builder';
import './components/HeroWithChildren/HeroWithChildren.builder';
import './components/DynamicColumns/DynamicColumns.builder';

// Add your public apiKey here
const YOUR_KEY = '_';

builder.init(YOUR_KEY);

const App = props => {
  const [notFound, setNotFound] = useState(false);
  const classes = useStyles();

  return (
    <div>
      <Header />
      <div className={classes.container}>
        {!notFound ? (
          // For server side rendering see here: https://github.com/BuilderIO/builder/tree/master/packages/react/examples/next-js
          <BuilderComponent
            name="page"
            contentLoaded={content => {
              if (!content && !Builder.isEditing) {
                setNotFound(true);
              }
            }}
          >
            <div className="loading">Loading...</div>
          </BuilderComponent>
        ) : (
          <NotFound /> // Your 404 content
        )}
      </div>
      <Footer />
    </div>
  );
};

const Footer = () => {
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

const Header = () => {
  const classes = useStyles();
  return (
    <div className={classes.header}>
      <div className={classes.link}>Shop</div>
      <div className={classes.logo}>SHOPAHOLIC</div>
      <div className={classes.link}>Cart</div>
    </div>
  );
};

const NotFound = () => {
  const classes = useStyles();
  return <h3 className={classes.notFound}>No page found for this URL, did you publish it?</h3>;
};

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    padding: 10,
  },
  footer: {
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'center',
    fontSize: 12,
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
  container: {
    minHeight: 'calc(100vh - 150px)',
  },
  notFound: {
    padding: '100px 20px',
    textAlign: 'center',
    fontWeight: 100,
  },
}));

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
