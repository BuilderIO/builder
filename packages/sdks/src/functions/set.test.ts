import { set, setCopyOnWrite, unset } from './set.js';

test('can shallow set a property', () => {
  const obj = { foo: 'bar' };
  set(obj, 'foo', 'baz');
  expect(obj.foo).toBe('baz');
});

test('can deeply set a property', () => {
  const obj = { foo: 'bar' };
  set(obj, 'foo.bar', 'baz');
  expect((obj.foo as any).bar).toBe('baz');
});

test('can deeply create arrays', () => {
  const obj = { foo: 'bar' };
  set(obj, 'foo.bar.0', 'hi');
  expect((obj.foo as any).bar).toEqual(['hi']);
});

describe('setCopyOnWrite', () => {
  test('copies objects along the path instead of mutating them', () => {
    const shared = { large: { color: 'red' }, small: { color: 'blue' } };
    const original = Object.freeze({ styles: Object.freeze(shared) });
    const copy: any = { ...original };
    const copied = new WeakSet<object>();

    setCopyOnWrite(copy, 'styles.large.zIndex', 2, copied);
    setCopyOnWrite(copy, 'styles.large.opacity', 1, copied);

    expect(copy.styles.large).toEqual({ color: 'red', zIndex: 2, opacity: 1 });
    expect(copy.styles.small).toBe(shared.small);
    expect(shared.large).toEqual({ color: 'red' });
  });

  test('creates missing objects and arrays like set', () => {
    const copy: any = {};
    setCopyOnWrite(copy, 'foo.bar.0', 'hi', new WeakSet());
    setCopyOnWrite(copy, 'a[1].b', 'c', new WeakSet());
    expect(copy.foo.bar).toEqual(['hi']);
    expect(copy.a[1]).toEqual({ b: 'c' });
  });

  test('copies arrays on the path', () => {
    const list = [{ label: 'a' }, { label: 'b' }];
    const copy: any = { list };
    setCopyOnWrite(copy, 'list.1.label', 'z', new WeakSet());
    expect(copy.list).not.toBe(list);
    expect(copy.list[0]).toBe(list[0]);
    expect(copy.list[1].label).toBe('z');
    expect(list[1].label).toBe('b');
  });
});

describe('prototype path guard', () => {
  afterEach(() => {
    delete (Object.prototype as any).polluted;
  });

  test('set ignores __proto__ and constructor.prototype paths', () => {
    set({}, '__proto__.polluted', true);
    set({}, 'constructor.prototype.polluted', true);
    set({}, ['__proto__', 'polluted'], true);
    expect(({} as any).polluted).toBeUndefined();
  });

  test('setCopyOnWrite ignores __proto__ and constructor.prototype paths', () => {
    setCopyOnWrite({}, '__proto__.polluted', true, new WeakSet());
    setCopyOnWrite({}, 'constructor.prototype.polluted', true, new WeakSet());
    expect(({} as any).polluted).toBeUndefined();
  });
});

describe('unset', () => {
  test('deletes a nested property', () => {
    const obj = { a: { b: 1, c: 2 } };
    unset(obj, ['a', 'b']);
    expect(obj).toEqual({ a: { c: 2 } });
  });

  test('ignores missing parents and unsafe paths', () => {
    const obj = { a: 1 };
    unset(obj, ['missing', 'b']);
    unset(obj, ['__proto__', 'toString']);
    expect(obj).toEqual({ a: 1 });
    expect(typeof ({} as any).toString).toBe('function');
  });
});

describe('inherited values', () => {
  afterEach(() => {
    delete (Object.prototype.toString as any).polluted;
  });

  test('set does not walk into inherited values', () => {
    const obj: any = {};
    set(obj, ['toString', 'polluted'], true);
    expect((Object.prototype.toString as any).polluted).toBeUndefined();
    expect(obj.toString).toEqual({ polluted: true });
  });

  test('setCopyOnWrite does not walk into inherited values', () => {
    const obj: any = {};
    setCopyOnWrite(obj, 'toString.polluted', true, new WeakSet());
    expect((Object.prototype.toString as any).polluted).toBeUndefined();
    expect(obj.toString).toEqual({ polluted: true });
  });

  test('unset does not walk into inherited values', () => {
    (Object.prototype.toString as any).polluted = true;
    unset({}, ['toString', 'polluted']);
    expect((Object.prototype.toString as any).polluted).toBe(true);
  });
});
