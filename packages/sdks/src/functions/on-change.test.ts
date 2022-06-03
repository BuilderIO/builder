import { onChange } from './on-change.js';

test('onChange can observe a shallow change', () => {
  let changeHappend = false;
  const obj = onChange({ foo: 'hi' }, () => (changeHappend = true));
  obj.foo = 'yo';
  expect(changeHappend).toBe(true);
});

test('onChange can observe a deep change', () => {
  let changeHappend = false;
  const obj = onChange({ foo: { bar: 'hi' } }, () => (changeHappend = true));
  obj.foo.bar = 'yo';
  expect(changeHappend).toBe(true);
});

test('Smoke test: callback is not fired if no properties updated', () => {
  let changeHappend = false;
  const obj = onChange({ foo: { bar: 'hi' } }, () => (changeHappend = true));
  // Access some properties
  obj.foo.bar;
  expect(changeHappend).toBe(false);
});
