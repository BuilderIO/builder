import './index.css';
import './builder-settings';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import ReactDOM from 'react-dom';
import '@builder.io/widgets';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Product } from './pages/Product';
import { Collection } from './pages/Collection';
import { CatchAll } from './pages/CatchAll';

const App = () => {
  const classes = useStyles();

  return (
    <Router>
      <Header />
      <div className={classes.container}>
        <Switch>
          <Route path="/collections">
            <Collection />
          </Route>
          <Route path="/products" component={props => <Product {...props} />} />
          <Route path="/">
            <CatchAll />
          </Route>
        </Switch>
      </div>
      <Footer />
    </Router>
  );
};

const useStyles = makeStyles(theme => ({
  link: {
    color: '#555',
    margin: '0 10px',
  },
  container: {
    minHeight: 'calc(100vh - 150px)',
  },
}));

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
