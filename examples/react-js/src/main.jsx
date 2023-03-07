import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, BrowserRouter, Link } from 'react-router-dom';
import { BuilderComponent, builder } from '@builder.io/react';

import './index.css';

builder.init('bb209db71e62412dbe0114bdae18fd15');

function App() {
  const [allPages, setAllPages] = useState([]);

  useEffect(() => {
    async function getStaticProps() {
      const pages = await builder.getAll('page', {
        fields: 'data.url,name',
        options: { noTargeting: true },
      });
      setAllPages(pages);
    }
    getStaticProps();
  }, []);

  return (
    <BrowserRouter>
      <header>
        <div className="logo">MY SITE</div>
        <div className="links">
          <Link className="link" to="/">
            Home
          </Link>
          <Link className="link" to="/about">
            About
          </Link>
          {allPages.map(page => {
            return (
              <Link className="link" to={page.data.url}>
                {page.name}
              </Link>
            );
          })}
          <Link className="link" to="/404">
            404
          </Link>
        </div>
      </header>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/about" exact component={About} />
          <Route render={({ location }) => <CatchallPage key={location.key} />} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

class CatchallPage extends React.Component {
  state = { notFound: false };

  render() {
    return !this.state.notFound ? (
      <BuilderComponent
        apiKey="bb209db71e62412dbe0114bdae18fd15"
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
      <NotFound /> // Your 404 content
    );
  }
}

const Home = () => <h1>I am the homepage!</h1>;
const About = () => <h1>I am the about page!</h1>;
const NotFound = () => <h1>No page found for this URL, did you publish it?</h1>;

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
