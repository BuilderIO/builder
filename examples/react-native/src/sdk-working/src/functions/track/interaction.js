function round(num) {
  return Math.round(num * 1e3) / 1e3;
}
const findParentElement = (target, callback, checkElement = true) => {
  if (!(target instanceof HTMLElement)) {
    return null;
  }
  let parent = checkElement ? target : target.parentElement;
  do {
    if (!parent) {
      return null;
    }
    const matches = callback(parent);
    if (matches) {
      return parent;
    }
  } while (parent = parent.parentElement);
  return null;
};
const findBuilderParent = (target) => findParentElement(target, (el) => {
  const id = el.getAttribute("builder-id") || el.id;
  return Boolean((id == null ? void 0 : id.indexOf("builder-")) === 0);
});
const computeOffset = ({
  event,
  target
}) => {
  const targetRect = target.getBoundingClientRect();
  const xOffset = event.clientX - targetRect.left;
  const yOffset = event.clientY - targetRect.top;
  const xRatio = round(xOffset / targetRect.width);
  const yRatio = round(yOffset / targetRect.height);
  return {
    x: xRatio,
    y: yRatio
  };
};
const getInteractionPropertiesForEvent = (event) => {
  const target = event.target;
  const targetBuilderElement = target && findBuilderParent(target);
  const builderId = (targetBuilderElement == null ? void 0 : targetBuilderElement.getAttribute("builder-id")) || (targetBuilderElement == null ? void 0 : targetBuilderElement.id);
  return {
    targetBuilderElement: builderId || void 0,
    metadata: {
      targetOffset: target ? computeOffset({ event, target }) : void 0,
      builderTargetOffset: targetBuilderElement ? computeOffset({ event, target: targetBuilderElement }) : void 0,
      builderElementIndex: targetBuilderElement && builderId ? [].slice.call(document.getElementsByClassName(builderId)).indexOf(targetBuilderElement) : void 0
    }
  };
};
export {
  getInteractionPropertiesForEvent
};
