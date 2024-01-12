import { logger } from "../../helpers/logger.js";
import { chooseBrowserOrServerEval } from "./choose-eval.js";
import { getBuilderGlobals, parseCode } from "./helpers.js";
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
  const args = {
    code: parseCode(code, {
      isExpression
    }),
    builder: getBuilderGlobals(),
    context,
    event,
    rootSetState,
    rootState,
    localState
  };
  try {
    return chooseBrowserOrServerEval(args);
  } catch (e) {
    logger.error("Failed code evaluation: " + e.message, {
      code
    });
    return void 0;
  }
}
export { evaluate }