import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, BrowserRouter, Link } from 'react-router-dom';
import { BuilderComponent, BuilderContent, builder } from '@builder.io/react';

import './index.css';

builder.init('cebf462cf12940c78302d9b4a201d7e6')

function App() {
  return (
    <BuilderContent model='multipage-funnel'>
      {(data, loading) => {
        if (loading) {
          return 'loading...'
        }
        if (!data) {
          return 'no data have you connected builder correctly?'
        }

        return (<BrowserRouter>
        <header>
          <div className="logo">MY SITE</div>

          <div className="links">
            {
              data.pages.map(page => <Link key={page.urlPath} className="link" to={page.urlPath}>{page.title}</Link>)
            }
          </div>
        </header>
        <div className="App">
          <Switch>
            {
              data.pages.map((page) => {
                return <Route key={page.urlPath} path={page.urlPath} exact component={() => <BuilderComponent model="funnel-section" entry={page.content.id} />} />
              })
            }
            <Route render={({ location }) => <CatchallPage key={location.key} />} />
          </Switch>
        </div>
      </BrowserRouter>)

      }}
    </BuilderContent>

  );
}

class CatchallPage extends React.Component {
  state = { notFound: false };

  render() {
    return !this.state.notFound ? (
      <BuilderComponent
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

const NotFound = () => <h1>No page found for this URL, did you publish it?</h1>;

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
