import { CONTENT as columns } from './columns.js';
import { CONTENT as homepage } from './homepage.js';
import { CONTENT as symbols } from './symbols.js';
import { CONTENT as contentBindings } from './content-bindings';
import { CONTENT as symbolBindings } from './symbol-bindings';
import { CONTENT as image } from './image.js';
import { CONTENT as dataBindings } from './data-bindings.js';
import { CONTENT as dataBindingStyles } from './data-binding-styles.js';
import { CONTENT as customBreakpoints } from './custom-breakpoints.js';

// TO-DO: import real content type from SDKs
interface Breakpoints {
  small: number;
  medium: number;
}
type Nullable<T> = T | null | undefined;
type BuilderContent = Partial<{
  data: { [index: string]: any };
  meta?: { breakpoints?: Nullable<Breakpoints>; [index: string]: any };
}>;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function fastClone<T extends object>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}

const getPathnameFromWindow = () => isBrowser() && window.location.pathname;

export const getContentForPathname = (
  pathname = getPathnameFromWindow()
): BuilderContent | null => {
  let contentWithoutBreakpoints = undefined;
  switch (pathname) {
    case '/':
      return homepage;
    case '/columns':
      return columns;
    case '/symbols':
      return symbols;
    case '/symbol-bindings':
      return symbolBindings;
    case '/content-bindings':
      return contentBindings;
    case '/image':
      return image;
    case '/data-bindings':
      return dataBindings;
    case '/data-binding-styles':
      return dataBindingStyles;
    case '/custom-breakpoints':
      return customBreakpoints as BuilderContent;
    case '/custom-breakpoints-reset':
      contentWithoutBreakpoints = fastClone(
        customBreakpoints as BuilderContent
      );
      delete contentWithoutBreakpoints.meta!.breakpoints;
      return contentWithoutBreakpoints;
    default:
      return null;
  }
};
