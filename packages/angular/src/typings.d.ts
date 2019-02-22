/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module '*.png' {
  const value: string;
  export = value;
}

declare module 'cookies';
