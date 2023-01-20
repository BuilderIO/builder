function round(num: number) {
  return Math.round(num * 1000) / 1000;
}
const findParentElement = (
  target: HTMLElement,
  callback: (element: HTMLElement) => boolean,
  checkElement = true
): HTMLElement | null => {
  if (!(target instanceof HTMLElement)) {
    return null;
  }
  let parent: HTMLElement | null = checkElement ? target : target.parentElement;
  do {
    if (!parent) {
      return null;
    }

    const matches = callback(parent);
    if (matches) {
      return parent;
    }
  } while ((parent = parent.parentElement));

  return null;
};

const findBuilderParent = (target: HTMLElement) =>
  findParentElement(target, (el) => {
    const id = el.getAttribute('builder-id') || el.id;
    return Boolean(id?.indexOf('builder-') === 0);
  });

type Offset = {
  x: number;
  y: number;
};

const computeOffset = ({
  event,
  target,
}: {
  event: MouseEvent;
  target: HTMLElement;
}): Offset => {
  const targetRect = target.getBoundingClientRect();
  const xOffset = event.clientX - targetRect.left;
  const yOffset = event.clientY - targetRect.top;

  const xRatio = round(xOffset / targetRect.width);
  const yRatio = round(yOffset / targetRect.height);

  return {
    x: xRatio,
    y: yRatio,
  };
};

export const getInteractionPropertiesForEvent = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  const targetBuilderElement = target && findBuilderParent(target);
  const builderId =
    targetBuilderElement?.getAttribute('builder-id') ||
    targetBuilderElement?.id;

  return {
    targetBuilderElement: builderId || undefined,
    metadata: {
      targetOffset: target ? computeOffset({ event, target }) : undefined,
      builderTargetOffset: targetBuilderElement
        ? computeOffset({ event, target: targetBuilderElement })
        : undefined,
      builderElementIndex:
        targetBuilderElement && builderId
          ? ([] as Element[]).slice
              .call(document.getElementsByClassName(builderId))
              .indexOf(targetBuilderElement)
          : undefined,
    },
  };
};
