declare module 'js-interpreter' {
  export default class Interpreter {
    // eslint-disable-next-line @typescript-eslint/ban-types
    constructor(code: string, initFunc?: Function);
    run(): void;
    createNativeFunction(func: (...args: any[]) => any): void;
    setProperty(globalObject: any, key: string, value: any): void;
    pseudoToNative(value: any): any;
    value: any;
  }
}
