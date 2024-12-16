type TraverseCallback = (value: any, update: (newValue: any) => void) => void;

/**
 * Recursively traverses an object or array, invoking a callback on each value.
 *
 * @param {any} obj - The object or array to traverse. Can also handle primitives, null, or undefined.
 * @param {TraverseCallback} callback - The function to invoke on each value. Receives the current value
 * and an `update` function to modify the value in its parent container.
 * @param {any} [parent=null] - The parent object or array of the current value. Used internally.
 * @param {any} [key=null] - The key or index of the current value in its parent. Used internally.
 * @param {WeakSet} [visited=new WeakSet()] - Tracks visited objects to handle circular references. Used internally.
 *
 * @example
 * // Example: Doubling all numbers in an object
 * const obj = { a: 1, b: [2, 3, { c: 4 }] };
 * traverse(obj, (value, update) => {
 *   if (typeof value === 'number') {
 *     update(value * 2);
 *   }
 * });
 * console.log(obj); // { a: 2, b: [4, 6, { c: 8 }] }
 *
 * @example
 * // Example: Handling circular references
 * const obj = { a: 1 };
 * obj.self = obj;
 * traverse(obj, (value, update) => {
 *   if (typeof value === 'number') {
 *     update(value * 2);
 *   }
 * });
 * console.log(obj.a); // 2
 */
export function traverse(
  obj: any,
  callback: TraverseCallback,
  parent: any = null,
  key: any = null,
  visited = new WeakSet()
): void {
  if (obj == null || typeof obj !== 'object') {
    callback(obj, (newValue: any) => {
      if (parent !== null && key !== null) {
        parent[key] = newValue;
      }
    });
    return;
  }

  if (visited.has(obj)) {
    return;
  }
  visited.add(obj);

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const update = (newValue: any) => {
        obj[index] = newValue;
      };
      callback(item, update);
      traverse(item, callback, obj, index, visited);
    });
  } else {
    Object.entries(obj).forEach(([key, value]) => {
      const update = (newValue: any) => {
        obj[key] = newValue;
      };
      callback(value, update);
      traverse(value, callback, obj, key, visited);
    });
  }
}
