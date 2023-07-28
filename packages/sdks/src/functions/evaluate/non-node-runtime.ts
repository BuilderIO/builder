import Interpreter from './interpreter';
import type { ExecutorArgs } from './types';

// const visitor: Visitor = {
//   AssignmentExpression(path) {
//     if (path.node.operator !== '=') return;

//     const lhs = path.node.left;
//     const rhs = path.node.right;

//     if (!types.isMemberExpression(lhs)) return;
//     const setTo = types.identifier('setRootState');

//     /**
//      * Given `state['r'].click['a']['boo'].b = state.click + 10`, returns `r.click.a.boo.b`
//      */
//     const getSetStr = () => {
//       const setStringName = [];
//       let node: types.MemberExpression | undefined = lhs;

//       while (node) {
//         const name = types.isIdentifier(node.property)
//           ? node.property.name
//           : types.isStringLiteral(node.property)
//           ? node.property.value
//           : undefined;

//         if (name) {
//           setStringName.push(name);
//         }

//         node = types.isMemberExpression(node.object) ? node.object : undefined;
//       }
//       const setStr = setStringName.reverse().join('.');

//       return setStr;
//     };

//     const setStr = getSetStr();

//     const setExpr = types.expressionStatement(
//       types.callExpression(setTo, [types.identifier("'" + setStr + "'"), rhs])
//     );

//     const ifExpr = types.ifStatement(
//       types.memberExpression(
//         types.identifier('Builder'),
//         types.identifier('isNonNodeRuntime')
//       ),
//       types.blockStatement([setExpr])
//     );

//     path.insertAfter(ifExpr);
//   },
// };

const processCode = (code: string) => {
  // return transform(code, {
  //   presets: ['es2015'],
  //   plugins: [[() => ({ visitor })]],
  // }).code;

  return code.split('\n').map((line) => {
    const trimmed = line.trim();
    const isStateSetter = trimmed.startsWith('state.');

    if (!isStateSetter) return;

    const [lhs, rhs] = trimmed.split('=');

    const setStr = lhs.replace('state.', '').trim();

    const setExpr = `setRootState('${setStr}', ${rhs.trim()})`;

    return `
    if (Builder.isNonNodeRuntime) {
      ${setExpr}
    }
    `;
  });
};

const getJSONValName = (val: string) => val + 'JSON';

export const runInNonNode = ({
  builder,
  context,
  event,
  state,
  useCode,
}: ExecutorArgs) => {
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

  ${processCode(useCode)}
  `;

  const setRootState = (prop: string, value: any) => {
    console.log('setRootState', { prop, value });
    // TO-DO
    state[prop] = value;
  };

  const initFunc = function (interpreter: any, globalObject: any) {
    /**
     * serialize all function args to JSON strings
     */
    Object.keys(properties).forEach((key) => {
      const val = properties[key as keyof typeof properties];
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
