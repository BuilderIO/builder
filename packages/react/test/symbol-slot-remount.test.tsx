/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { render } from '@testing-library/react';
import { Builder, builder } from '@builder.io/sdk';
import { BuilderPage } from '../src/builder-react';
import { block } from './functions/render-block';

builder.init('null');

let mountCount = 0;

const MountCounter = (props: { title?: string; testid?: string }) => {
  React.useEffect(() => {
    mountCount++;
  }, []);
  return <div data-testid={props.testid || 'counter'}>{props.title}</div>;
};

Builder.registerComponent(MountCounter, {
  name: 'MountCounter',
  inputs: [
    { name: 'title', type: 'text' },
    { name: 'testid', type: 'text' },
  ],
});

const slotChild = (title: string, id = 'builder-child-1', testid?: string) =>
  block('MountCounter', { title, testid }, { id } as any);

const symbolBlock = (opts: {
  id?: string;
  entry?: string;
  children?: any[];
  heading?: string;
  slotName?: string;
}) =>
  block(
    'Symbol',
    {
      symbol: {
        model: 'symbol',
        entry: opts.entry || 'entry-1',
        content: {
          id: 'sym-1',
          data: {
            blocks: [
              block('Slot', { name: opts.slotName || 'children' }, { id: 'builder-slot-1' } as any),
            ],
          },
        },
        data: {
          ...(opts.heading !== undefined && { heading: opts.heading }),
          [opts.slotName || 'children']: opts.children ?? [slotChild('A')],
        },
      },
    },
    { id: opts.id || 'builder-symbol-1' } as any
  );

const page = (blocks: any[]) => ({ id: 'page-1', data: { blocks } });

describe('symbol + slot editing (editor)', () => {
  beforeEach(() => {
    mountCount = 0;
    Builder.isEditing = true;
  });

  afterEach(() => {
    Builder.isEditing = false;
  });

  it('does not remount slot children when their options change', () => {
    const testApi = render(<BuilderPage model="page" content={page([symbolBlock({})]) as any} />);

    const nodeBefore = testApi.getByTestId('counter');
    expect(nodeBefore).toHaveTextContent('A');
    expect(mountCount).toBe(1);

    testApi.rerender(
      <BuilderPage
        model="page"
        content={page([symbolBlock({ children: [slotChild('AB')] })]) as any}
      />
    );

    expect(testApi.getByTestId('counter')).toBe(nodeBefore);
    expect(nodeBefore).toHaveTextContent('AB');
    expect(mountCount).toBe(1);
  });

  it('still applies adds and removes of slot children', () => {
    const testApi = render(<BuilderPage model="page" content={page([symbolBlock({})]) as any} />);
    expect(testApi.getByTestId('counter')).toHaveTextContent('A');

    testApi.rerender(
      <BuilderPage
        model="page"
        content={
          page([
            symbolBlock({
              children: [slotChild('A'), slotChild('B', 'builder-child-2', 'counter-2')],
            }),
          ]) as any
        }
      />
    );
    expect(testApi.getByTestId('counter-2')).toHaveTextContent('B');

    testApi.rerender(
      <BuilderPage model="page" content={page([symbolBlock({ children: [] })]) as any} />
    );
    expect(testApi.queryByTestId('counter')).toBeNull();
    expect(testApi.queryByTestId('counter-2')).toBeNull();
  });

  it('still remounts when a non-slot symbol input changes', () => {
    const testApi = render(
      <BuilderPage model="page" content={page([symbolBlock({ heading: 'one' })]) as any} />
    );
    const nodeBefore = testApi.getByTestId('counter');
    expect(mountCount).toBe(1);

    testApi.rerender(
      <BuilderPage model="page" content={page([symbolBlock({ heading: 'two' })]) as any} />
    );

    expect(testApi.getByTestId('counter')).not.toBe(nodeBefore);
    expect(mountCount).toBe(2);
  });

  it('renders two instances of the same symbol with different slot content', () => {
    const testApi = render(
      <BuilderPage
        model="page"
        content={
          page([
            symbolBlock({ id: 'builder-symbol-1', children: [slotChild('first', 'c1', 'one')] }),
            symbolBlock({ id: 'builder-symbol-2', children: [slotChild('second', 'c2', 'two')] }),
          ]) as any
        }
      />
    );

    expect(testApi.getByTestId('one')).toHaveTextContent('first');
    expect(testApi.getByTestId('two')).toHaveTextContent('second');
  });
});

describe('symbol + slot rendering (production)', () => {
  beforeEach(() => {
    mountCount = 0;
  });

  it('renders slot content and reacts to data changes', () => {
    const testApi = render(
      <BuilderPage model="page" content={page([symbolBlock({ heading: 'one' })]) as any} />
    );
    expect(testApi.getByTestId('counter')).toHaveTextContent('A');

    testApi.rerender(
      <BuilderPage model="page" content={page([symbolBlock({ heading: 'two' })]) as any} />
    );
    expect(testApi.getByTestId('counter')).toHaveTextContent('A');
  });

  it('keys on slot content exactly as before, since the fix is editor only', () => {
    const testApi = render(<BuilderPage model="page" content={page([symbolBlock({})]) as any} />);
    const nodeBefore = testApi.getByTestId('counter');
    expect(mountCount).toBe(1);

    testApi.rerender(
      <BuilderPage
        model="page"
        content={page([symbolBlock({ children: [slotChild('AB')] })]) as any}
      />
    );

    expect(testApi.getByTestId('counter')).not.toBe(nodeBefore);
    expect(mountCount).toBe(2);
  });
});
