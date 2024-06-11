import { camelToKebabCase } from '../../functions/camel-to-kebab-case.js';
import type { BuilderAnimation } from '../../types/builder-block.js';

// eslint-disable-next-line @typescript-eslint/ban-types
function throttle(func: Function, wait: number, options: any = {}) {
  let context: any;
  let args: any;
  let result: any;
  let timeout = null as any;
  let previous = 0;
  const later = function () {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function (this: any) {
    const now = Date.now();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    context = this;
    // eslint-disable-next-line prefer-rest-params
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

function assign(target: object, ..._args: any[]) {
  const to = Object(target);

  for (let index = 1; index < arguments.length; index++) {
    // eslint-disable-next-line prefer-rest-params
    const nextSource = arguments[index];

    if (nextSource != null) {
      // Skip over if undefined or null
      for (const nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
}

export function bindAnimations(animations: BuilderAnimation[]) {
  for (const animation of animations) {
    switch (animation.trigger) {
      case 'pageLoad':
        triggerAnimation(animation);
        break;
      case 'scrollInView':
        bindScrollInViewAnimation(animation);
        break;
    }
  }
}

function warnElementNotPresent(id: string) {
  console.warn(`Cannot animate element: element with ID ${id} not found!`);
}

function augmentAnimation(animation: BuilderAnimation, element: HTMLElement) {
  const stylesUsed = getAllStylesUsed(animation);
  const computedStyle: any = getComputedStyle(element);
  // const computedStyle = getComputedStyle(element);
  // // FIXME: this will break if original load is in one reponsive size then resize to another hmmm
  // Need to use transform instead of left since left can change on screen sizes
  const firstStyles = animation.steps[0].styles;
  const lastStyles = animation.steps[animation.steps.length - 1]!.styles;
  const bothStyles = [firstStyles, lastStyles];

  // FIXME: this won't work as expected for augmented animations - may need the editor itself to manage this
  for (const styles of bothStyles) {
    for (const style of stylesUsed) {
      if (!(style in styles)) {
        styles[style as any] = computedStyle[style];
      }
    }
  }
}

function getAllStylesUsed(animation: BuilderAnimation) {
  const properties: (keyof CSSStyleDeclaration)[] = [];
  for (const step of animation.steps) {
    for (const key in step.styles) {
      if (properties.indexOf(key as any) === -1) {
        properties.push(key as any);
      }
    }
  }
  return properties;
}

export function triggerAnimation(animation: BuilderAnimation) {
  // TODO: do for ALL elements
  const elements = Array.prototype.slice.call(
    document.getElementsByClassName(animation.elementId || animation.id || '')
  ) as HTMLElement[];
  if (!elements.length) {
    warnElementNotPresent(animation.elementId || animation.id || '');
    return;
  }

  Array.from(elements).forEach((element) => {
    augmentAnimation(animation, element);
    // TODO: do this properly, may have other animations of different properties

    // TODO: only override the properties
    // TODO: if there is an entrance and hover animation, the transition duration will get effed
    // element.setAttribute('style', '');

    // const styledUsed = this.getAllStylesUsed(animation);
    element.style.transition = 'none';
    element.style.transitionDelay = '0';
    assign(element.style, animation.steps[0].styles);
    // TODO: queue/batch these timeouts
    // TODO: only include properties explicitly set in the animation
    // using Object.keys(styles)
    setTimeout(() => {
      element.style.transition = `all ${animation.duration}s ${camelToKebabCase(
        animation.easing
      )}`;
      if (animation.delay) {
        element.style.transitionDelay = animation.delay + 's';
      }
      assign(element.style, animation.steps[1].styles);
      // TODO: maybe remove/reset transitoin property after animation duration

      // TODO: queue timers
      setTimeout(
        () => {
          // TODO: what if has other transition (reset back to what it was)
          element.style.transition = '';
          element.style.transitionDelay = '';
        },
        (animation.delay || 0) * 1000 + animation.duration * 1000 + 100
      );
    });
  });
}

// TODO: unbind on element remove
export function bindScrollInViewAnimation(animation: BuilderAnimation) {
  // TODO: apply to ALL matching elements
  const elements = Array.prototype.slice.call(
    document.getElementsByClassName(animation.elementId || animation.id || '')
  ) as HTMLElement[];
  if (!elements.length) {
    warnElementNotPresent(animation.elementId || animation.id || '');
    return;
  }

  // TODO: if server side rendered and scrolled into view don't animate...
  Array.from(elements).forEach((element) => {
    augmentAnimation(animation, element);

    let triggered = false;
    let pendingAnimation = false;
    function immediateOnScroll() {
      if (!triggered && isScrolledIntoView(element)) {
        triggered = true;
        pendingAnimation = true;
        setTimeout(() => {
          assign(element!.style, animation.steps[1].styles);
          if (!animation.repeat) {
            document.removeEventListener('scroll', onScroll);
          }
          setTimeout(
            () => {
              pendingAnimation = false;
              if (!animation.repeat) {
                element.style.transition = '';
                element.style.transitionDelay = '';
              }
            },
            (animation.duration + (animation.delay || 0)) * 1000 + 100
          );
        });
      } else if (
        animation.repeat &&
        triggered &&
        !pendingAnimation &&
        !isScrolledIntoView(element)
      ) {
        // we want to repeat the animation every time the the element is out of view and back again
        triggered = false;
        assign(element!.style, animation.steps[0].styles);
      }
    }

    // TODO: roll all of these in one for more efficiency of checking all the rects
    const onScroll = throttle(immediateOnScroll, 200, { leading: false });

    // TODO: fully in view or partially
    function isScrolledIntoView(elem: HTMLElement) {
      const rect = elem.getBoundingClientRect();

      const windowHeight = window.innerHeight;

      const thresholdPercent = (animation.thresholdPercent || 0) / 100;
      const threshold = thresholdPercent * windowHeight;

      // TODO: partial in view? or what if element is larger than screen itself
      return (
        rect.bottom > threshold && rect.top < windowHeight - threshold // Element is peeking top or bottom
        // (rect.top > 0 && rect.bottom < window.innerHeight) || // element fits within the screen and is fully on screen (not hanging off at all)
        // (rect.top < 0 && rect.bottom > window.innerHeight) // element is larger than the screen and hangs over the top and bottom
      );
    }

    const defaultState = animation.steps[0].styles;
    function attachDefaultState() {
      assign(element!.style, defaultState);
    }
    attachDefaultState();

    // TODO: queue/batch these timeouts!
    setTimeout(() => {
      element.style.transition = `all ${animation.duration}s ${camelToKebabCase(
        animation.easing
      )}`;
      if (animation.delay) {
        element.style.transitionDelay = animation.delay + 's';
      }
    });

    // TODO: one listener for everything
    document.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    } as any);

    // Do an initial check
    immediateOnScroll();
  });
}
