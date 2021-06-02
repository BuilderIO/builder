import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, BrowserRouter, Link, useHistory, useRouteMatch } from 'react-router-dom';
import { BuilderComponent, BuilderContent, builder } from '@builder.io/react';

import './index.css';

builder.init('cebf462cf12940c78302d9b4a201d7e6');

function App() {
  return (
    <BrowserRouter>
      <BuilderContent options={{ includeRefs: true }} model="multipage-funnel">
        {(funnel, loading) => {
          if (loading) {
            return 'loading...';
          }
          if (!funnel) {
            return 'no data have you connected builder correctly?';
          }
          return <Steps funnel={funnel} />;
        }}
      </BuilderContent>
    </BrowserRouter>
  );
}

const CustomLink = ({ to, ...props }) => {
  const match = useRouteMatch({ to, exact: true });
  return <Link className={match ? 'active-link' : 'link'} to={to} {...props} />;
};

const Steps = ({ funnel }) => {
  const history = useHistory();
  const navigateNext = step => {
    // will be called in funnel sections as state.navigateNext;
    history.push(getStepLink(step + 1));
  };

  const navigateBack = step => history.push(getStepLink(step - 1));

  const getStepLink = index => (index === 0 ? '/' : `/step-${index}`);

  return (
    <>
      <header>
        <div className="logo">MY Multistep Funnel</div>

        <div className="links">
          {funnel.sections.map((page, index) => (
            <CustomLink key={index} className="link" to={getStepLink(index)}>
              {page.title}
            </CustomLink>
          ))}
        </div>
      </header>
      <div className="App">
        <Switch>
          {funnel.sections.map((section, index) => {
            return (
              <Route
                key={index}
                path={getStepLink(index)}
                exact
                component={() => (
                  <BuilderComponent
                    data={{
                      navigateBack: navigateBack.bind(null, index),
                      navigateNext: navigateNext.bind(null, index),
                      hasPrev: index > 0,
                      hasNext: index < funnel.sections.length - 1,
                    }}
                    model="funnel-section"
                    content={section.content.value}
                  />
                )}
              />
            );
          })}
        </Switch>
      </div>
    </>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
