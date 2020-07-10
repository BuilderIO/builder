import { Context, Liquid as LLiquid, Expression } from 'liquidjs';
import { toValue } from './utils/async';
import { registerLiquidFilters } from './utils/register-liquid-filters';

const liquid = new LLiquid();
registerLiquidFilters(liquid);

interface State {
  [key: string]: any;
}

// Ugly temporary workaround

export class Shopify {
  state: State;
  liquid: Liquid;

  constructor(state: State) {
    this.state = state;
    this.liquid = new Liquid(state);
  }

  toJSON() {
    return null;
  }

  get(str: string, state = this.state) {
    return this.liquid.get(str, state);
  }

  render(str: string, state = this.state) {
    return this.liquid.render(str, state);
  }

  // Variation - instaed or as well
  addToCart(productId: string | number) {
    // TODO
  }
}

export class Liquid {
  state: State;

  constructor(state: State) {
    this.state = state;
  }

  // TODO: preparse and split out for better perf
  render(str: string, state = this.state) {
    // TODO: what if has partials or other aysnc things? may be rare...
    // TODO: separate parse and render to memoise the parsing
    // TODO: use expression and parse cache?

    // TODO: fix the toValue in liquidjs
    return liquid.parseAndRenderSync(str, state);
  }

  condition(str: string | boolean, state = this.state) {
    let string: string;
    if (typeof str !== 'string') {
      string = `${str}`;
    } else {
      string = str;
    }
    const useStr = string.replace(/selected_or_first_available_variant/g, 'variants[0]');
    const result = toValue(new Expression(useStr).value(new Context(state, undefined, true)));
    return result;
  }

  get(str: string, state = this.state) {
    // TODO: better solution e.g. with proxies
    let useStr = str.replace(/selected_or_first_available_variant/g, 'variants[0]');
    // TODO: warn for errors
    return liquid.evalValueSync(useStr, new Context(state, undefined, true));
    // const result = toValue(new Expression(useStr).value(new Context(state, undefined, true)));
    // return result;
  }

  // TODO: handle `t` filter at compile time in assign
  assign(str: string, state = this.state) {
    const re = /^\s*([^=\s]+)\s*=(.*)/;
    let useStr = str.replace(/selected_or_first_available_variant/g, 'variants[0]');
    const match = useStr.match(re)!;
    const key = match[1].trim();
    const value = match[2];
    // const result = liquid.evalValueSync(value, new Context(state, undefined, true));
    const result = toValue(new Expression(value).value(new Context(state, undefined, true)));
    state[key] = result;
  }
}

export default Shopify;
