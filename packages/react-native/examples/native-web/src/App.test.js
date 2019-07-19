import React from 'react';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import App from './App';

describe('App', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<App/>);
    expect(tree.toJSON()).toBeTruthy();
  });
});
