import { render } from '@testing-library/react';
import * as React from 'react';
import { IfElseBlock } from '../../react/components/IfElse';
import { mockState, text } from '../modules/helpers';


describe('IfElse', () => {
  test('Basic True', () => {
    const ref = render(
      <IfElseBlock
        branches={[
          {
            expression: 'foo === "bar"',
            blocks: [text('A')],
          },
        ]}
        builderState={mockState({ foo: 'bar' })}
      />
    );

    expect(ref.queryByText('A')).toBeTruthy();
  });
  test('Basic False', () => {
    const ref = render(
      <IfElseBlock
        branches={[
          {
            expression: 'foo === "hi"',
            blocks: [text('A')],
          },
        ]}
        builderState={mockState({ foo: 'bar' })}
      />
    );

    expect(ref.queryByText('A')).toBeNull();
  });

  test('Basic Else True', () => {
    const ref = render(
      <IfElseBlock
        branches={[
          {
            expression: 'foo === "bar"',
            blocks: [text('A')],
          },
          {
            blocks: [text('B')],
          },
        ]}
        builderState={mockState({ foo: 'bar' })}
      />
    );

    expect(ref.queryByText('A')).toBeTruthy();
    expect(ref.queryByText('B')).toBeNull();
  });

  test('Basic Else False', () => {
    const ref = render(
      <IfElseBlock
        branches={[
          {
            expression: 'foo === "yo"',
            blocks: [text('A')],
          },
          {
            blocks: [text('B')],
          },
        ]}
        builderState={mockState({ foo: 'bar' })}
      />
    );

    expect(ref.queryByText('A')).toBeNull();
    expect(ref.queryByText('B')).toBeTruthy();
  });

  test('Basic ElseIf', () => {
    const ref = render(
      <IfElseBlock
        branches={[
          {
            expression: 'foo === "yo"',
            blocks: [text('A')],
          },
          {
            expression: 'foo === "bar"',
            blocks: [text('B')],
          },
          {
            blocks: [text('C')],
          },
        ]}
        builderState={mockState({ foo: 'bar' })}
      />
    );

    expect(ref.queryByText('A')).toBeNull();
    expect(ref.queryByText('B')).toBeTruthy();
    expect(ref.queryByText('C')).toBeNull();
  });

  test('Multi ElseIf', () => {
    const ref = render(
      <IfElseBlock
        branches={[
          {
            expression: 'foo === "yo"',
            blocks: [text('A')],
          },
          {
            expression: 'foo === "no"',
            blocks: [text('B')],
          },
          {
            expression: 'foo === "bar"',
            blocks: [text('C')],
          },
        ]}
        builderState={mockState({ foo: 'bar' })}
      />
    );

    expect(ref.queryByText('A')).toBeNull();
    expect(ref.queryByText('B')).toBeNull();
    expect(ref.queryByText('C')).toBeTruthy();
  });
});
