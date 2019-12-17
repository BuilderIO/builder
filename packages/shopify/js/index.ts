import { Context, Liquid as LLiquid } from 'liquidjs';

const liquid = new LLiquid();

interface State {
  [key: string]: any;
}

export default class Shopify {
  state: State;

  constructor(state: State) {
    this.state = state;
  }

  liquid = new Liquid(this.state);
}

export class Liquid {
  state: State;

  constructor(state: State) {
    this.state = state;
  }

  get(str: string) {
    return liquid.evalValueSync(str, new Context(this.state, undefined, true));
  }

  assign(str: string) {
    const re = /^\s*([^=\s+])\s*=(.*)/;
    const match = str.match(re)!;
    const key = match[1].trim();
    const value = match[2];
    this.state[key] = liquid.evalValueSync(value, new Context(this.state, undefined, true));
  }
}
