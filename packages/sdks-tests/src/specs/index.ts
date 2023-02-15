import { CONTENT as columns } from './columns.js';
import { CONTENT as elementEvents } from './element-events.js';
import { CONTENT as homepage } from './homepage.js';
import { CONTENT as cssNesting } from './css-nesting.js';
import { CONTENT as symbols } from './symbols.js';
import { CONTENT as contentBindings } from './content-bindings';
import { CONTENT as symbolBindings } from './symbol-bindings';
import { CONTENT as image } from './image.js';
import { CONTENT as dataBindings } from './data-bindings.js';
import { CONTENT as dataBindingStyles } from './data-binding-styles.js';
import { CONTENT as customBreakpoints } from './custom-breakpoints.js';
import { CONTENT as reactiveState } from './reactive-state';
import { CONTENT as showHideIf } from './show-hide-if';

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

const getPathnameFromWindow = (): string => (isBrowser() ? window.location.pathname : '');

const getContentForPathname = (pathname: string): BuilderContent | null => {
  let contentWithoutBreakpoints = undefined;
  switch (pathname) {
    case '/can-track-false':
    case '/':
      return homepage;
    case '/css-nesting':
      return cssNesting;
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
    case '/reactive-state':
      return reactiveState;
    case '/element-events':
      return elementEvents;
    case '/show-hide-if':
      return showHideIf;
    case '/custom-breakpoints-reset':
      contentWithoutBreakpoints = fastClone(customBreakpoints as BuilderContent);
      delete contentWithoutBreakpoints.meta!.breakpoints;
      return contentWithoutBreakpoints;
    default:
      return null;
  }
};

// remove trailing slash from pathname if it exists
// unless it's the root path
const normalizePathname = (pathname: string): string =>
  pathname === '/' ? pathname : pathname.replace(/\/$/, '');

export const getProps = (
  _pathname = getPathnameFromWindow()
): {
  model: string;
  content: BuilderContent;
  apiKey: string;
} | null => {
  const pathname = normalizePathname(_pathname);
  const content = getContentForPathname(pathname);

  if (!content) {
    return null;
  }

  const extraProps =
    pathname === '/can-track-false'
      ? {
          canTrack: false,
        }
      : {};

  return {
    content,
    apiKey: 'f1a790f8c3204b3b8c5c1795aeac4660',
    model: 'page',
    ...extraProps,
  };
};
