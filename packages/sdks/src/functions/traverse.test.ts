import { traverse } from './traverse.js';

describe('traverse', () => {
  it('handles primitives correctly', () => {
    const primitive = 42;
    traverse(primitive, (value, update) => {
      if (typeof value === 'number') {
        update(value * 2);
      }
    });
    expect(primitive).toBe(42);
  });

  it('handles arrays correctly', () => {
    const arr = [1, 2, 3];
    traverse(arr, (value, update) => {
      if (typeof value === 'number') {
        update(value * 2);
      }
    });
    expect(arr).toEqual([2, 4, 6]);
  });

  it('handles nested objects correctly', () => {
    const obj = { a: 1, b: { c: 2, d: 3 } };
    traverse(obj, (value, update) => {
      if (typeof value === 'number') {
        update(value * 2);
      }
    });
    expect(obj).toEqual({ a: 2, b: { c: 4, d: 6 } });
  });

  it('handles mixed arrays and objects', () => {
    const data = { a: [1, { b: 2 }, 3], c: 4 };
    traverse(data, (value, update) => {
      if (typeof value === 'number') {
        update(value * 2);
      }
    });
    expect(data).toEqual({ a: [2, { b: 4 }, 6], c: 8 });
  });

  it('handles circular references gracefully', () => {
    const obj: any = { a: 1 };
    obj.b = obj; // Circular reference

    traverse(obj, (value, update) => {
      if (typeof value === 'number') {
        update(value * 2);
      }
    });

    expect(obj.a).toBe(2);
    expect(obj.b).toBe(obj);
  });

  it('handles null values correctly', () => {
    const obj = { a: null, b: 2 };
    traverse(obj, (value, update) => {
      if (value === null) {
        update('null-value');
      }
    });
    expect(obj).toEqual({ a: 'null-value', b: 2 });
  });

  it('handles undefined values correctly', () => {
    const obj = { a: undefined, b: 2 };
    traverse(obj, (value, update) => {
      if (value === undefined) {
        update('undefined-value');
      }
    });
    expect(obj).toEqual({ a: 'undefined-value', b: 2 });
  });

  it('handles empty arrays and objects', () => {
    const emptyArr: any[] = [];
    const emptyObj: Record<string, any> = {};

    traverse(emptyArr, (value, update) => {
      update('modified');
    });
    expect(emptyArr).toEqual([]);

    traverse(emptyObj, (value, update) => {
      update('modified');
    });
    expect(emptyObj).toEqual({});
  });

  it('does not mutate visited objects', () => {
    const obj: any = { a: { b: 1 } };
    obj.a.c = obj.a;

    traverse(obj, (value, update) => {
      if (typeof value === 'number') {
        update(value * 2);
      }
    });

    expect(obj.a.b).toBe(2);
    expect(obj.a.c).toBe(obj.a);
  });
});
