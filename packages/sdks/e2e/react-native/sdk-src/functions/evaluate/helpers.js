import { isBrowser } from "../is-browser.js";
import { isEditing } from "../is-editing.js";
import { getUserAttributes } from "../track/helpers.js";
const getFunctionArguments = ({
  builder,
  context,
  event,
  state
}) => {
  return Object.entries({
    state,
    Builder: builder,
    builder,
    context,
    event
  });
};
const getBuilderGlobals = () => ({
  isEditing: isEditing(),
  isBrowser: isBrowser(),
  isServer: !isBrowser(),
  getUserAttributes: () => getUserAttributes()
});
const parseCode = (code, {
  isExpression = true
}) => {
  const useReturn = isExpression && !(code.includes(";") || code.includes(" return ") || code.trim().startsWith("return "));
  const useCode = useReturn ? `return (${code});` : code;
  return useCode;
};
export { getBuilderGlobals, getFunctionArguments, parseCode }