import { logger } from "../../helpers/logger.js";
import { isBrowser } from "../is-browser.js";
import { isEditing } from "../is-editing.js";
import { getUserAttributes } from "../track/helpers.js";
import { evaluator } from "placeholder-runtime";

function evaluate({
  code,
  context,
  localState,
  rootState,
  rootSetState,
  event,
  isExpression = true
}) {
  if (code === "") {
    logger.warn("Skipping evaluation of empty code block.");
    return;
  }

  const builder = {
    isEditing: isEditing(),
    isBrowser: isBrowser(),
    isServer: !isBrowser(),
    getUserAttributes: () => getUserAttributes()
  };
  const useReturn = isExpression && !(code.includes(";") || code.includes(" return ") || code.trim().startsWith("return "));
  const useCode = useReturn ? `return (${code});` : code;
  const args = {
    code: useCode,
    builder,
    context,
    event,
    rootSetState,
    rootState,
    localState
  };

  try {
    return evaluator(args);
  } catch (e) {
    logger.error("Failed code evaluation: " + e.message, {
      code
    });
    return void 0;
  }
}

export { evaluate }