import { render } from '@testing-library/react';
import * as React from 'react';
import { AssignBlock } from '../../react/components/assign';
import { mockStateWithShopify } from '../modules/helpers';

describe('Assign', () => {
  test('Basic assignment', () => {
    const state: any = {};
    const ref = render(<AssignBlock expression="foo = 'bar'" builderState={mockStateWithShopify(state)} />);
    expect(state.foo).toEqual('bar');
  });

  test('Multi assignment', () => {
    const state: any = {};
    const ref = render(<>
      <AssignBlock expression="foo = 'bar'" builderState={mockStateWithShopify(state)} />
      <AssignBlock expression="bar = foo" builderState={mockStateWithShopify(state)} />
    </>);
    expect(state.bar).toEqual('bar');
  });
});
