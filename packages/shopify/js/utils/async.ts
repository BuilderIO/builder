type resolver = (x?: any) => Thenable;

interface Thenable {
  then(resolve: resolver, reject?: resolver): Thenable;
  catch(reject: resolver): Thenable;
}

function mkResolve(value: any) {
  const ret = {
    then: (resolve: resolver) => resolve(value),
    catch: () => ret,
  };
  return ret;
}

function mkReject(err: Error) {
  const ret = {
    then: (resolve: resolver, reject?: resolver) => {
      if (reject) return reject(err);
      return ret;
    },
    catch: (reject: resolver) => reject(err),
  };
  return ret;
}

function isThenable(val: any): val is Thenable {
  return val && isFunction(val.then);
}

function isCustomIterable(val: any): val is IterableIterator<any> {
  return val && isFunction(val.next) && isFunction(val.throw) && isFunction(val.return);
}

export function toThenable(val: IterableIterator<any> | Thenable | any): Thenable {
  if (isThenable(val)) return val;
  if (isCustomIterable(val)) return reduce();
  return mkResolve(val);

  function reduce(prev?: any): Thenable {
    let state;
    try {
      state = (val as IterableIterator<any>).next(prev);
    } catch (err) {
      return mkReject(err);
    }

    if (state.done) return mkResolve(state.value);
    return toThenable(state.value!).then(reduce, err => {
      let state;
      try {
        state = (val as IterableIterator<any>).throw!(err);
      } catch (e) {
        return mkReject(e);
      }
      if (state.done) return mkResolve(state.value);
      return reduce(state.value);
    });
  }
}

export function toValue(val: IterableIterator<any> | Thenable | any) {
  let ret: any;
  toThenable(val)
    .then((x: any) => {
      ret = x;
      return mkResolve(ret);
    })
    .catch((err: Error) => {
      throw err;
    });
  return ret;
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}
