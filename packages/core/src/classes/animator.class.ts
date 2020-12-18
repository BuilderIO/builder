import { throttle } from '../functions/throttle.function';
import { assign } from '../functions/assign.function';

const camelCaseToKebabCase = (str?: string) =>
  str ? str.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`) : '';

export interface AnimationStep {
  // First one is always start state
  // isStartState?: boolean;
  styles: { [key: string]: string };
  delay?: number;
}

export interface Animation {
  elementId: string;
  trigger: string;
  steps: AnimationStep[];
  duration: number;
  delay?: number;
  easing?: string;
  // TODO: deprecate - only here because of an API bug
  id?: string;
}

export class Animator {
  bindAnimations(animations: Animation[]) {
    for (const animation of animations) {
      switch (animation.trigger) {
        case 'pageLoad':
          this.triggerAnimation(animation);
          break;
        case 'hover':
          this.bindHoverAnimation(animation);
          break;
        case 'scrollInView':
          this.bindScrollInViewAnimation(animation);
          break;
      }
    }
  }

  private warnElementNotPresent(id: string) {
    console.warn(`Cannot animate element: element with ID ${id} not found!`);
  }

  private augmentAnimation(animation: Animation, element: HTMLElement) {
    const stylesUsed = this.getAllStylesUsed(animation);
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
          styles[style] = computedStyle[style];
        }
      }
    }
  }

  private getAllStylesUsed(animation: Animation) {
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

  triggerAnimation(animation: Animation) {
    // TODO: do for ALL elements
    const elements = Array.prototype.slice.call(
      document.getElementsByClassName(animation.elementId || animation.id || '')
    ) as HTMLElement[];
    if (!elements.length) {
      this.warnElementNotPresent(animation.elementId || animation.id || '');
      return;
    }

    Array.from(elements).forEach(element => {
      this.augmentAnimation(animation, element);
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
        element.style.transition = `all ${animation.duration}s ${camelCaseToKebabCase(
          animation.easing
        )}`;
        if (animation.delay) {
          element.style.transitionDelay = animation.delay + 's';
        }
        assign(element.style, animation.steps[1].styles);
        // TODO: maybe remove/reset transitoin property after animation duration

        // TODO: queue timers
        setTimeout(() => {
          // TODO: what if has other transition (reset back to what it was)
          element.style.transition = '';
          element.style.transitionDelay = '';
        }, (animation.delay || 0) * 1000 + animation.duration * 1000 + 100);
      });
    });
  }

  bindHoverAnimation(animation: Animation) {
    // TODO: is it multiple binding when editing...?
    // TODO: unbind on element remove
    // TODO: apply to ALL elements
    const elements = Array.prototype.slice.call(
      document.getElementsByClassName(animation.elementId || animation.id || '')
    ) as HTMLElement[];
    if (!elements.length) {
      this.warnElementNotPresent(animation.elementId || animation.id || '');
      return;
    }

    Array.from(elements).forEach(element => {
      this.augmentAnimation(animation, element);

      const defaultState = animation.steps[0].styles;
      const hoverState = animation.steps[1].styles;
      function attachDefaultState() {
        assign(element!.style, defaultState);
      }
      function attachHoverState() {
        assign(element!.style, hoverState);
      }
      attachDefaultState();
      element.addEventListener('mouseenter', attachHoverState);
      element.addEventListener('mouseleave', attachDefaultState);
      // TODO: queue/batch these timeouts
      setTimeout(() => {
        element.style.transition = `all ${animation.duration}s ${camelCaseToKebabCase(
          animation.easing
        )}`;
        if (animation.delay) {
          element.style.transitionDelay = animation.delay + 's';
        }
      });
    });
  }

  // TODO: unbind on element remove
  bindScrollInViewAnimation(animation: Animation) {
    // TODO: apply to ALL matching elements
    const elements = Array.prototype.slice.call(
      document.getElementsByClassName(animation.elementId || animation.id || '')
    ) as HTMLElement[];
    if (!elements.length) {
      this.warnElementNotPresent(animation.elementId || animation.id || '');
      return;
    }

    // TODO: if server side rendered and scrolled into view don't animate...
    Array.from(elements).forEach(element => {
      this.augmentAnimation(animation, element);

      let triggered = false;
      function immediateOnScroll() {
        if (!triggered && isScrolledIntoView(element)) {
          triggered = true;
          setTimeout(() => {
            assign(element!.style, animation.steps[1].styles);
            document.removeEventListener('scroll', onScroll);
            setTimeout(() => {
              element.style.transition = '';
              element.style.transitionDelay = '';
            }, (animation.duration * 1000 + (animation.delay || 0)) * 1000 + 100);
          });
        }
      }

      // TODO: roll all of these in one for more efficiency of checking all the rects
      const onScroll = throttle(immediateOnScroll, 200, { leading: false });

      // TODO: fully in view or partially
      function isScrolledIntoView(elem: HTMLElement) {
        const rect = elem.getBoundingClientRect();

        const windowHeight = window.innerHeight;

        const thresholdPrecent = 0;
        const threshold = thresholdPrecent * windowHeight;

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
        element.style.transition = `all ${animation.duration}s ${camelCaseToKebabCase(
          animation.easing
        )}`;
        if (animation.delay) {
          element.style.transitionDelay = animation.delay + 's';
        }
      });

      // TODO: one listener for everything
      document.addEventListener('scroll', onScroll, { capture: true, passive: true } as any);

      // Do an initial check
      immediateOnScroll();
    });
  }
}
