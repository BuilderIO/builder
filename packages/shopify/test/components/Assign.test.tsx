import { render } from '@testing-library/react';
import * as React from 'react';
import { AssignBlock } from '../../react/components/Assign';
import { mockStateWithShopify } from '../modules/helpers';
import * as reactTestRenderer from 'react-test-renderer';

describe('Assign', () => {
  test('Basic assignment', () => {
    const state: any = {};
    const ref = render(
      <AssignBlock expression="foo = 'bar'" builderState={mockStateWithShopify(state)} />
    );
    expect(state.foo).toEqual('bar');
  });

  test('Multi assignment', () => {
    const state: any = {};
    const ref = render(
      <>
        <AssignBlock expression="foo = 'bar'" builderState={mockStateWithShopify(state)} />
        <AssignBlock expression="bar = foo" builderState={mockStateWithShopify(state)} />
      </>
    );
    expect(state.bar).toEqual('bar');
  });

  it('renders snapshot correctly', () => {
    const state: any = {};
    const tree = reactTestRenderer
      .create(<AssignBlock expression="foo = 'bar'" builderState={mockStateWithShopify(state)} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
