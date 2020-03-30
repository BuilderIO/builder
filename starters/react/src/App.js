import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { BuilderComponent } from '@builder.io/react';

const API_KEY = 'bb209db71e62412dbe0114bdae18fd15';

function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/topics">Topics</Link>
          </li>
          <li>
            <Link to="/page-1">Builder Page 1</Link>
          </li>
          <li>
            <Link to="/page-2">Builder Page 2</Link>
          </li>
        </ul>

        <hr />

        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route render={({ location }) => <CatchallPage key={location.key} />} />
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}

function About() {
  return (
    <div>
      <h2>About</h2>
    </div>
  );
}

class CatchallPage extends React.Component {
  state = { notFound: false };

  render() {
    return !this.state.notFound ? (
      <BuilderComponent
        apiKey={API_KEY}
        model="page"
        contentLoaded={content => {
          if (!content) {
            this.setState({ notFound: true });
          }
        }}
      >
        <div className="loading">Loading...</div>
      </BuilderComponent>
    ) : (
      <NotFound />
    );
  }
}

const NotFound = () => <h1>No page found for this URL, did you publish it?</h1>;

export default App;
