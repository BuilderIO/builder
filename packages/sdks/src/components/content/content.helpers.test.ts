import type { RegisteredComponent } from '../../context/types.js';
import {
  getComponentInfos,
  getLiveRootState,
  getRegisteredComponents,
  getRootStateInitialValue,
} from './content.helpers.js';

describe('getRootStateInitialValue', () => {
  test('state writes never reach the content object', () => {
    const content = {
      data: {
        state: { user: { name: 'guest' }, cart: ['a'] },
        inputs: [
          { name: 'prefs', type: 'object', defaultValue: { theme: 'light' } },
        ],
      },
    };
    const rootState: any = getRootStateInitialValue({
      content: content as any,
      data: undefined,
      locale: undefined,
    });

    rootState.user.name = 'alice';
    rootState.cart.push('b');
    rootState.prefs.theme = 'dark';

    expect(content.data.state).toEqual({
      user: { name: 'guest' },
      cart: ['a'],
    });
    expect(content.data.inputs[0].defaultValue).toEqual({ theme: 'light' });
    expect(
      getRootStateInitialValue({
        content: content as any,
        data: undefined,
        locale: undefined,
      })
    ).toEqual({
      prefs: { theme: 'light' },
      user: { name: 'guest' },
      cart: ['a'],
    });
  });

  test('keeps non-plain values and `data` by reference', () => {
    const fn = () => 1;
    const date = new Date(0);
    const data = { live: { count: 1 } };
    const rootState: any = getRootStateInitialValue({
      content: { data: { state: { fn, date } } } as any,
      data,
      locale: 'fr',
    });

    expect(rootState.fn).toBe(fn);
    expect(rootState.date).toBe(date);
    expect(rootState.live).toBe(data.live);
    expect(rootState.locale).toBe('fr');
  });
});

describe('getRegisteredComponents', () => {
  const Button = () => null;
  const Custom = () => null;
  const registrations = [
    { name: 'Core:Button', component: Button, inputs: [] },
    {
      name: 'Custom',
      component: Custom,
      inputs: [{ name: 'items', type: 'list', onChange: (o: any) => o }],
    },
  ] as unknown as RegisteredComponent[];

  test('later registrations override earlier ones with the same name', () => {
    const Override = () => null;
    const result = getRegisteredComponents(
      [...registrations, { name: 'Core:Button', component: Override } as any],
      (c) => c
    );
    expect(result['Core:Button'].component).toBe(Override);
    expect(Object.keys(result)).toEqual(['Core:Button', 'Custom']);
  });

  test('serializes functions like registration messages and reuses entries', () => {
    const first = getRegisteredComponents(registrations, (c) => c);
    const second = getRegisteredComponents(registrations, (c) => c);

    expect(first.Custom.component).toBe(Custom);
    expect(typeof (first.Custom.inputs as any)[0].onChange).toBe('string');
    expect(second.Custom).toBe(first.Custom);
    // a registry built from another registry's entries (what Symbol does) reuses them too
    const nested = getRegisteredComponents(Object.values(first), (c) => c);
    expect(nested.Custom.component).toBe(Custom);
    expect(getRegisteredComponents(Object.values(first), (c) => c).Custom).toBe(
      nested.Custom
    );
  });

  test('component infos omit the component', () => {
    const infos = getComponentInfos(registrations);
    expect(infos.Custom).not.toHaveProperty('component');
    expect(infos.Custom.name).toBe('Custom');
  });
});

describe('getLiveRootState', () => {
  test('reads and writes the current root state after it is replaced', () => {
    let rootState: Record<string, any> = { count: 1 };
    const live = getLiveRootState(() => rootState);

    rootState = { ...rootState, article: { title: 'fetched' } };
    live.count = live.count + 1;

    expect(rootState).toEqual({ count: 2, article: { title: 'fetched' } });
    expect(live.article.title).toBe('fetched');
    expect('article' in live).toBe(true);
    expect({ ...live }).toEqual(rootState);
  });
});
