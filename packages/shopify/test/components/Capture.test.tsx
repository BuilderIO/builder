import { render } from '@testing-library/react';
import * as React from 'react';
import { CaptureBlock } from '../../react/components/Capture';
import { mockStateWithShopify } from '../modules/helpers';
import * as reactTestRenderer from 'react-test-renderer';

describe('Capture', () => {
  test('With simple string', () => {
    const state: any = {};
    const ref = render(
      <CaptureBlock
        variableName="name"
        expression="John"
        builderState={mockStateWithShopify(state)}
      />
    );
    expect(state.name).toEqual('John');
  });

  test('With state values', () => {
    const state: any = {
      age: 30,
      favorite_food: 'pizza',
    };
    const ref = render(
      <CaptureBlock
        variableName="about_me"
        expression="I am {{ age }} and my favorite food is {{ favorite_food }}."
        builderState={mockStateWithShopify(state)}
      />
    );
    expect(state.about_me).toEqual('I am 30 and my favorite food is pizza.');
  });

  test('Multiple values', () => {
    const state: any = {
      age: 30,
      favorite_food: 'pizza',
    };
    const ref = render(
      <>
        <CaptureBlock
          variableName="about_me"
          expression="I am {{ age }} and my favorite food is {{ favorite_food }}."
          builderState={mockStateWithShopify(state)}
        />
        <CaptureBlock
          variableName="food"
          expression="Favorite food is {{ favorite_food }}."
          builderState={mockStateWithShopify(state)}
        />
      </>
    );
    expect(state.about_me).toEqual('I am 30 and my favorite food is pizza.');
    expect(state.food).toEqual('Favorite food is pizza.');
  });

  it('renders snapshot correctly', () => {
    const state: any = {};
    const tree = reactTestRenderer
      .create(
        <CaptureBlock
          variableName="about_me"
          expression="I am {{ age }} and my favorite food is {{ favorite_food }}."
          builderState={mockStateWithShopify(state)}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
