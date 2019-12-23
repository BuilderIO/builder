import { render } from '@testing-library/react';
import * as React from 'react';
import { UnlessBlock } from '../../react/components/Unless';
import { mockState, text } from '../modules/helpers';

describe('IfElse', () => {
  test('Basic Unless True', () => {
    const ref = render(
      <UnlessBlock
        expression="foo === 'bar'"
        unlessBlocks={[text('A')]}
        builderState={mockState({ foo: 'bar' })}
      />
    );

    expect(ref.queryByText('A')).toBeNull();
  });
  test('Basic Unless False', () => {
    const ref = render(
      <UnlessBlock
        expression="foo === 'bar'"
        unlessBlocks={[text('A')]}
        builderState={mockState({ foo: 'yo' })}
      />
    );

    expect(ref.queryByText('A')).toBeTruthy();
  });

  test('Basic Else False', () => {
    const ref = render(
      <UnlessBlock
        expression="foo === 'bar'"
        unlessBlocks={[text('A')]}
        elseBlocks={[text('B')]}
        builderState={mockState({ foo: 'bar' })}
      />
    );

    expect(ref.queryByText('A')).toBeNull();
    expect(ref.queryByText('B')).toBeTruthy();
  });

  test('Basic Else True', () => {
    const ref = render(
      <UnlessBlock
        expression="foo === 'bar'"
        unlessBlocks={[text('A')]}
        elseBlocks={[text('B')]}
        builderState={mockState({ foo: 'ya' })}
      />
    );

    expect(ref.queryByText('A')).toBeTruthy();
    expect(ref.queryByText('B')).toBeNull();
  });
});
