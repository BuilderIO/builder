import { applyPatchWithMinimalMutationChain } from './apply-patch-with-mutation';

describe('applyPatchWithMinimalMutationChain', () => {
  test('Basic shallow update', () => {
    const obj = {
      foo: 'bar',
    };
    const patch = {
      op: 'replace',
      path: '/foo',
      value: '60px',
    } as const;
    const applied = applyPatchWithMinimalMutationChain(obj, patch);
    expect(applied.foo).toBe('60px');
    expect(applied).not.toBe(obj);
  });

  test('Deep object updates', () => {
    const obj = {
      foo: {
        bar: true,
      },
      baz: {},
    };
    const patch = {
      op: 'replace',
      path: '/foo/bar',
      value: '60px',
    } as const;
    const applied = applyPatchWithMinimalMutationChain(obj, patch);
    expect(applied.foo.bar).toBe('60px');
    expect(applied).not.toBe(obj);
    expect(applied.foo).not.toBe(obj.foo);
    expect(applied.baz).toBe(obj.baz);
  });

  test('Deep array updates', () => {
    const obj = {
      foo: [{ bar: true }],
      baz: {},
    };
    const patch = {
      op: 'replace',
      path: '/foo/0/bar',
      value: '60px',
    } as const;

    const applied = applyPatchWithMinimalMutationChain(obj, patch);
    expect(applied.foo[0].bar).toBe('60px');
    expect(applied).not.toBe(obj);
    expect(applied.foo).not.toBe(obj.foo);
    expect(applied.foo[0]).not.toBe(obj.foo[0]);
    expect(applied.baz).toBe(obj.baz);
  });
});
