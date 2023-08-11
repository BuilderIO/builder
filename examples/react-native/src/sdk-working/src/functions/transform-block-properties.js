import { isEditing } from "./is-editing.js";
import { findDOMNode } from "react-dom";
function transformBlockProperties(block) {
  block.ref = (ref) => {
    if (isEditing()) {
      const el = findDOMNode(ref);
      if (el) {
        el.setAttribute("builder-id", block.id);
        el.classList.add(block.id);
      }
    }
  };
  return block;
}
export {
  transformBlockProperties
};
