import { Context, Liquid as LLiquid } from 'liquidjs';

const liquid = new LLiquid();

liquid.registerFilter('money', value => {
  const str = String(value);
  // TODO: locales
  return '$' + str.slice(0, -2) + '.' + str.slice(-2);
});

interface State {
  [key: string]: any;
}

// Ugly temporary workaround

export default class Shopify {
  state: State;
  liquid: Liquid;

  constructor(state: State) {
    this.state = state;
    this.liquid = new Liquid(state);
  }

  toJSON() {
    return null;
  }
}

export class Liquid {
  state: State;

  constructor(state: State) {
    this.state = state;
  }

  get(str: string) {
    // TODO: better solution e.g. with proxies
    let useStr = str.replace(/selected_or_first_available_variant/g, 'variants[0]');
    return liquid.evalValueSync(useStr, new Context(this.state, undefined, true));
  }

  // TODO: handle `t` filter at compile time in assign
  assign(str: string) {
    const re = /^\s*([^=\s]+)\s*=(.*)/;
    let useStr = str.replace(/selected_or_first_available_variant/g, 'variants[0]');
    const match = useStr.match(re)!;
    const key = match[1].trim();
    const value = match[2];
    this.state[key] = liquid.evalValueSync(value, new Context(this.state, undefined, true));
  }
}
