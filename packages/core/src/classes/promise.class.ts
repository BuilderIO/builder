import { nextTick } from '../functions/next-tick.function';

const State = {
  Pending: 'Pending',
  Fulfilled: 'Fulfilled',
  Rejected: 'Rejected',
};

function isFunction(val: any) {
  return val && typeof val === 'function';
}

function isObject(val: any) {
  return val && typeof val === 'object';
}

interface Handler<T> {
  onFulfilled: (val: T) => any;
  onRejected: (err: any) => any;
}

export class TinyPromise<T = any> {
  private _state = State.Pending;
  private _handlers: Handler<T>[] = [];
  private _value: T | null = null;

  constructor(executor: (resolve: (val: T) => any, reject: (err: T) => any) => void) {
    executor(this._resolve.bind(this), this._reject.bind(this));
  }

  private _resolve(x: any) {
    if (x instanceof TinyPromise) {
      x.then(this._resolve.bind(this), this._reject.bind(this));
    } else if (isObject(x) || isFunction(x)) {
      let called = false;
      try {
        const thenable = (x as Promise<any>).then;
        if (isFunction(thenable)) {
          thenable.call(
            x,
            (result: any) => {
              if (!called) this._resolve(result);
              called = true;
              return undefined as any;
            },
            (error: any) => {
              if (!called) this._reject(error);
              called = true;
              return undefined as any;
            }
          );
        } else {
          this._fulfill(x);
        }
      } catch (ex) {
        if (!called) {
          this._reject(ex);
        }
      }
    } else {
      this._fulfill(x);
    }
  }

  private _fulfill(result: T) {
    this._state = State.Fulfilled;
    this._value = result;
    this._handlers.forEach(handler => this._callHandler(handler));
  }

  private _reject(error: any) {
    this._state = State.Rejected;
    this._value = error;
    this._handlers.forEach(handler => this._callHandler(handler));
  }

  private _isPending() {
    return this._state === State.Pending;
  }

  private _isFulfilled() {
    return this._state === State.Fulfilled;
  }

  private _isRejected() {
    return this._state === State.Rejected;
  }

  private _addHandler(onFulfilled: (val: T) => any, onRejected: (err: any) => any) {
    this._handlers.push({
      onFulfilled,
      onRejected,
    });
  }

  private _callHandler(handler: Handler<T>) {
    if (this._isFulfilled() && isFunction(handler.onFulfilled)) {
      handler.onFulfilled(this._value as T);
    } else if (this._isRejected() && isFunction(handler.onRejected)) {
      handler.onRejected(this._value);
    }
  }

  then(onFulfilled: (val: T) => any, onRejected: (err: any) => any) {
    switch (this._state) {
      case State.Pending: {
        return new TinyPromise((resolve, reject) => {
          this._addHandler(
            value => {
              nextTick(() => {
                try {
                  if (isFunction(onFulfilled)) {
                    resolve(onFulfilled(value));
                  } else {
                    resolve(value);
                  }
                } catch (ex) {
                  reject(ex);
                }
              });
            },
            error => {
              nextTick(() => {
                try {
                  if (isFunction(onRejected)) {
                    resolve(onRejected(error));
                  } else {
                    reject(error);
                  }
                } catch (ex) {
                  reject(ex);
                }
              });
            }
          );
        });
      }

      case State.Fulfilled: {
        return new TinyPromise((resolve, reject) => {
          nextTick(() => {
            try {
              if (isFunction(onFulfilled)) {
                resolve(onFulfilled(this._value as T));
              } else {
                resolve(this._value as T);
              }
            } catch (ex) {
              reject(ex);
            }
          });
        });
      }

      case State.Rejected: {
        return new TinyPromise((resolve, reject) => {
          nextTick(() => {
            try {
              if (isFunction(onRejected)) {
                resolve(onRejected(this._value));
              } else {
                reject(this._value);
              }
            } catch (ex) {
              reject(ex);
            }
          });
        });
      }
    }
  }
}

export default (typeof Promise !== 'undefined' ? Promise : TinyPromise) as PromiseConstructor;
