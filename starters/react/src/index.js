import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// To use service workers, uncomment the line below. Be sure before doing so
// to understand additional deloyment configuration this might require
// here https://facebook.github.io/create-react-app/docs/deployment
// serviceWorker.unregister();

// If you want your app to work offline and load faster, you can change
// unregister() to register() above. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
