import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BuilderComponent } from '@builder.io/react';
import { makeStyles } from '@material-ui/core/styles';
import './index.css';
import './components/ProductsList/ProductsList.builder';
import './components/Hero/Hero.builder';
import './components/TripleColumns/TripleColumns.builder';
import './components/DoubleColumns/DoubleColumns.builder';
import './components/Review/Review.builder';
import './components/ReviewsSlider/ReviewsSlider.builder';

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    padding: 10,
  },
  footer: {},
  link: {
    color: '#555',
  },
  logo: {
    margin: '0 auto',
    letterSpacing: 2,
    fontWeight: 600,
  },
}));

const App = props => {
  const [notFound, setNotFound] = useState(false);
  const classes = useStyles();

  return (
    <div>
      <div className={classes.header}>
        <div className={classes.link}>Shop</div>
        <div className={classes.logo}>SHOPAHOLIC</div>
        <div className={classes.link}>Cart</div>
      </div>
      <div>
        {!notFound ? (
          <BuilderComponent
            apiKey="YJIGb4i01jvw0SRdL5Bt"
            name="example-design-system"
            contentLoaded={content => {
              if (!content) {
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
      <div>{/* Footer */}</div>
    </div>
  );
};

const NotFound = () => <h1>No page found for this URL, did you publish it?</h1>;

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
