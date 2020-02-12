import React from 'react';
import ReactDOM from 'react-dom';
import { BuilderComponent } from '@builder.io/react';
import './index.css';
import './components/ProductsList/ProductsList.builder';
import './components/Hero/Hero.builder';
import './components/TripleColumns/TripleColumns.builder';
import './components/DoubleColumns/DoubleColumns.builder';

class App extends React.Component {
  state = { notFound: false };

  render() {
    return !this.state.notFound ? (
      <BuilderComponent
        apiKey="YJIGb4i01jvw0SRdL5Bt"
        name="example-design-system"
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
