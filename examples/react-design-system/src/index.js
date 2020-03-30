import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BuilderComponent, Builder } from '@builder.io/react/lite';
import { makeStyles } from '@material-ui/core/styles';
import './index.css';
import './builder-settings';

const App = () => {
  const [notFound, setNotFound] = useState(false);
  const classes = useStyles();

  return (
    <div>
      <Header />
      <div className={classes.container}>
        {!notFound ? (
          // For server side rendering see here: https://github.com/BuilderIO/builder/tree/master/packages/react/examples/next-js
          <BuilderComponent
            model="page"
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
  return (
    <div className={classes.notFound}>
      <h3 className={classes.notFoundTitle}>No page found for this URL, did you publish it?</h3>
      {process.env.NODE_ENV === 'development' && (
        <h4 className={classes.notFoundSubTitle}>
          To edit this page in Builder.io, go to{' '}
          <a target="_blank" href="https://builder.io">
            builder.io
          </a>
          , create a new page, and enter <pre>{window.location.href}</pre> as the editing URL (at
          the top right of the preview)
        </h4>
      )}
    </div>
  );
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
  },
  notFoundTitle: {
    fontWeight: 400,
  },
  notFoundSubTitle: {
    fontWeight: 100,
  },
}));

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
