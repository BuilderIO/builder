import { evaluate } from './evaluate';
import { getBuilderGlobals, parseCode } from './helpers';

const DEFAULTS = {
  builder: getBuilderGlobals(),
  context: {},
  event: undefined,
  localState: {},
  rootSetState: () => {},
  rootState: {},
};

const TESTS = {
  'does simple math': () => {
    const output = evaluate({
      ...DEFAULTS,
      code: parseCode('1 + 1', { isExpression: true }),
    });

    expect(output).toBe(2);
  },
  'returns state value': () => {
    const output = evaluate({
      ...DEFAULTS,
      code: parseCode('state.foo', { isExpression: true }),
      rootState: {
        foo: 'bar',
      },
    });

    expect(output).toBe('bar');
  },
  'returns nested state value': () => {
    const output = evaluate({
      ...DEFAULTS,
      code: parseCode('state.foo.bar.baz', { isExpression: true }),
      rootState: {
        foo: {
          bar: {
            baz: 'qux',
          },
        },
      },
    });

    expect(output).toBe('qux');
  },
  'returns nested local state value': () => {
    const output = evaluate({
      ...DEFAULTS,
      code: parseCode('state.foo[0].bar.baz', { isExpression: true }),
      localState: {
        foo: [
          {
            bar: {
              baz: 'qux',
            },
          },
        ],
      },
    });

    expect(output).toBe('qux');
  },
  'sets simple state value (using `rootSetState`)': () => {
    const rootState = {
      foo: 'bar',
    };

    evaluate({
      ...DEFAULTS,
      code: parseCode('state.foo = "baz"', { isExpression: true }),
      rootState,
      rootSetState: (newState) => {
        Object.assign(rootState, newState);
      },
    });

    expect(rootState.foo).toBe('baz');
  },
  'sets simple state value (if `rootState` is mutable)': () => {
    const rootState = {
      foo: 'bar',
    };

    evaluate({
      ...DEFAULTS,
      code: parseCode('state.foo = "baz"', { isExpression: true }),
      rootState,
      rootSetState: undefined,
    });

    expect(rootState.foo).toBe('baz');
  },
  'set & read simple state value (if `rootState` is mutable)': () => {
    const rootState: {
      a?: number;
      b?: number;
    } = {};

    const output = evaluate({
      ...DEFAULTS,
      code: parseCode(
        `
        state.a = 10;
        state.b = state.a + 4;
        var x = state.b;

        return x
      `,
        { isExpression: true }
      ),
      rootState,
      rootSetState: undefined,
    });

    expect(rootState.a).toBe(10);
    expect(rootState.b).toBe(14);
    expect(output).toBe(14);
  },
  'set & read simple state value (with `rootSetState`)': () => {
    const rootState: {
      a?: number;
      b?: number;
    } = {};

    const output = evaluate({
      ...DEFAULTS,
      code: parseCode(
        `
        state.a = 10;
        state.b = state.a + 4;
        var x = state.b;

        return x
      `,
        { isExpression: true }
      ),
      rootState,
      rootSetState: (newState) => {
        Object.assign(rootState, newState);
      },
    });

    expect(rootState.a).toBe(10);
    expect(rootState.b).toBe(14);
    expect(output).toBe(14);
  },
  'set Array state value (if `rootState` is mutable)': () => {
    const rootState: { a?: number[] } = {};

    evaluate({
      ...DEFAULTS,
      code: parseCode(`state.a = [10, 43];`, { isExpression: true }),
      rootState,
    });

    expect(rootState.a).toBeInstanceOf(Array);
    expect(rootState.a).toHaveLength(2);
    expect(rootState.a?.[0]).toBe(10);
    expect(rootState.a?.[1]).toBe(43);
  },
  'set value from async jsCode': () => {
    const rootState: {
      name?: string;
      list?: string[];
    } = {};

    evaluate({
      ...DEFAULTS,
      code: parseCode(
        `var __awaiter=function(e,t,n,r){return new(n||(n=Promise))((function(i,a){function o(e){try{l(r.next(e))}catch(e){a(e)}}function u(e){try{l(r.throw(e))}catch(e){a(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,u)}l((r=r.apply(e,t||[])).next())}))},__generator=function(e,t){var n,r,i,a,o={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return a={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function u(a){return function(u){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;o;)try{if(n=1,r&&(i=2&a[0]?r.return:a[0]?r.throw||((i=r.return)&&i.call(r),0):r.next)&&!(i=i.call(r,a[1])).done)return i;switch(r=0,i&&(a=[2&a[0],i.value]),a[0]){case 0:case 1:i=a;break;case 4:return o.label++,{value:a[1],done:!1};case 5:o.label++,r=a[1],a=[0];continue;case 7:a=o.ops.pop(),o.trys.pop();continue;default:if(!(i=(i=o.trys).length>0&&i[i.length-1])&&(6===a[0]||2===a[0])){o=0;continue}if(3===a[0]&&(!i||a[1]>i[0]&&a[1]<i[3])){o.label=a[1];break}if(6===a[0]&&o.label<i[1]){o.label=i[1],i=a;break}if(i&&o.label<i[2]){o.label=i[2],o.ops.push(a);break}i[2]&&o.ops.pop(),o.trys.pop();continue}a=t.call(e,o)}catch(e){a=[6,e],r=0}finally{n=i=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,u])}}};function main(){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(e){return state.name="initial Name",state.list=["first","second"],Builder.isServer,Builder.isBrowser,[2]}))}))}var _virtual_index=main();return _virtual_index`,
        { isExpression: false }
      ),
      rootState,
    });

    expect(rootState.name).toBe('initial Name');
    expect(rootState.list).toEqual(['first', 'second']);
  },
  'get array value from state': () => {
    const rootState: {
      name?: string;
      list?: string[];
    } = {
      list: ['first', 'second'],
    };

    const output = evaluate({
      ...DEFAULTS,
      code: parseCode(`state.list`, { isExpression: true }),
      rootState,
    });

    expect(output).toEqual(['first', 'second']);
  },
};

describe(`evaluate (${process.env.SDK_ENV})`, () => {
  describe('individual evaluations', () => {
    Object.keys(TESTS).forEach((key) => {
      test(key, () => {
        TESTS[key as keyof typeof TESTS]();
      });
    });
  });
  test('successfully runs multiple evaluations in random order', () => {
    const keys = Object.keys(TESTS);
    const randomKeys = keys.sort(() => Math.random() - 0.5);

    randomKeys.forEach((key) => {
      TESTS[key as keyof typeof TESTS]();
    });
  });
});
