export type Listener<T> = (value: T) => void;

export class Subscription<FunctionType = Function> {
  constructor(private listeners?: FunctionType[], private listener?: FunctionType) {}

  unsubscribed = false;

  get closed() {
    return this.unsubscribed;
  }

  private readonly otherSubscriptions: Subscription[] = [];

  add(subscription: Subscription) {
    this.otherSubscriptions.push(subscription);
  }

  unsubscribe() {
    if (this.unsubscribed) {
      return;
    }
    if (this.listener && this.listeners) {
      const index = this.listeners.indexOf(this.listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    }
    this.otherSubscriptions.forEach(sub => sub.unsubscribe());
    this.unsubscribed = true;
  }
}

// TODO: follow minimal basic spec: https://github.com/tc39/proposal-observable
export class BehaviorSubject<T = any, ErrorType = any> {
  constructor(public value: T) {}

  private listeners: Listener<T>[] = [];
  private errorListeners: Listener<ErrorType>[] = [];

  next(value: T) {
    this.value = value;
    for (const listener of this.listeners) {
      listener(value);
    }
  }

  // TODO: implement this as PIPE instead
  map<NewType = any>(fn: (item: T) => NewType) {
    const newSubject = new BehaviorSubject<NewType>(fn(this.value));
    // TODO: on destroy delete these
    this.subscribe(val => {
      newSubject.next(fn(val));
    });
    this.catch(err => {
      newSubject.error(err);
    });
    return newSubject;
  }

  catch(errorListener: Listener<ErrorType>) {
    this.errorListeners.push(errorListener);
    return new Subscription(this.errorListeners, errorListener);
  }

  error(error: ErrorType) {
    for (const listener of this.errorListeners) {
      listener(error);
    }
  }

  subscribe(listener: Listener<T>, errorListener?: Listener<ErrorType>) {
    this.listeners.push(listener);
    if (errorListener) {
      this.errorListeners.push(errorListener);
    }
    return new Subscription(this.listeners, listener);
  }

  toPromise() {
    return new Promise<T>((resolve, reject) => {
      const subscription = this.subscribe(
        value => {
          resolve(value);
          subscription.unsubscribe();
        },
        err => {
          reject(err);
          subscription.unsubscribe();
        }
      );
    });
  }

  promise() {
    return this.toPromise();
  }
}

// TODO: make different classes
export const Observer = BehaviorSubject;
export const Observable = BehaviorSubject;
