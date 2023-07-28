import { transform } from '@babel/standalone';
import Interpreter from './interpreter';
import { types } from '@babel/core';

const processCode = (code) => {
  // Be able to handle simple expressions like "state.foo" or "1 + 1"
  // as well as full blocks like "var foo = "bar"; return foo"
  const useReturn =
    // we disable this for cases where we definitely don't want a return
    true &&
    !(
      code.includes(';') ||
      code.includes(' return ') ||
      code.trim().startsWith('return ')
    );

  const useCode = useReturn ? `return (${code});` : code;

  const transformed = transform(useCode, {
    presets: ['es2015'],
    plugins: [
      [
        () => ({
          visitor: {
            /**
             * @param {import('@babel/core').NodePath<import('@babel/types').AssignmentExpression>} path
             */
            AssignmentExpression(path) {
              if (path.node.operator !== '=') return;

              const lhs = path.node.left;
              const rhs = path.node.right;

              if (!types.isMemberExpression(lhs)) return;
              const setTo = types.identifier('setRootState');

              /**
               * Given `state['r'].click['a']['boo'].b = state.click + 10`, returns `r.click.a.boo.b`
               */
              const getSetStr = () => {
                const setStringName = [];
                let node = lhs;

                while (node) {
                  const name = types.isIdentifier(node.property)
                    ? node.property.name
                    : types.isStringLiteral(node.property)
                    ? node.property.value
                    : undefined;

                  if (name) {
                    setStringName.push(name);
                  }

                  node = types.isMemberExpression(node.object)
                    ? node.object
                    : undefined;
                }
                const setStr = setStringName.reverse().join('.');

                return setStr;
              };

              const setStr = getSetStr();

              const setExpr = types.expressionStatement(
                types.callExpression(setTo, [
                  types.identifier("'" + setStr + "'"),
                  rhs,
                ])
              );

              const ifExpr = types.ifStatement(
                types.memberExpression(
                  types.identifier('Builder'),
                  types.identifier('isNonNodeRuntime')
                ),
                types.blockStatement([setExpr])
              );

              path.insertAfter(ifExpr);
            },
          },
        }),
      ],
    ],
  }).code;

  return transformed;
};

const getJSONValName = (val) => val + 'JSON';

export const runTest = (
  USER_CODE = `
state.clicked = true; 
state.bar += state.bar * 20

state.bar;
`,
  state = {
    foo: 'bar',
    bar: 1,
    clicked: false,
  },
  builder = {
    isNonNodeRuntime: true,
  },
  context = {},
  event = {}
) => {
  const properties = {
    state,
    Builder: builder,
    builder,
    context,
    event,
  };

  /**
   * Deserialize all properties from JSON strings to JS objects
   */
  const prependedCode = Object.keys(properties)
    .map((key) => `var ${key} = JSON.parse(${getJSONValName(key)});`)
    .join('\n');

  const transformed = `
  ${prependedCode}

  ${processCode(USER_CODE)}
  `;

  const setRootState = (prop, value) => {
    console.log('setRootState', { prop, value });
    state[prop] = value;
  };

  var initFunc = function (
    /**
     * @type {Interpreter}
     */
    interpreter,
    globalObject
  ) {
    /**
     * serialize all function args to JSON strings
     */
    Object.keys(properties).forEach((key) => {
      const val = properties[key];
      const jsonVal = JSON.stringify(val);
      interpreter.setProperty(globalObject, getJSONValName(key), jsonVal);
    });

    /**
     * Add a JavaScript function "setRootState" to the interpreter's global object, that will be called whenever a
     * state property is set. This function will update the state object.
     */
    interpreter.setProperty(
      globalObject,
      'setRootState',
      interpreter.createNativeFunction(setRootState)
    );
  };

  const myInterpreter = new Interpreter(transformed, initFunc);
  myInterpreter.run();

  const output = myInterpreter.value;

  return output;
};
