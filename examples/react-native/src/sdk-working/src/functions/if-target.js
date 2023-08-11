import { TARGET } from "../constants/target.js";
function ifTarget({
  targets,
  doThing,
  elseThing
}) {
  if (TARGET && targets.includes(TARGET)) {
    return doThing();
  } else {
    return elseThing == null ? void 0 : elseThing();
  }
}
export {
  ifTarget
};
