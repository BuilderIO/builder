import { CONTENT as columns } from './columns.js';
import { CONTENT as elementEvents } from './element-events.js';
import { CONTENT as homepage } from './homepage.js';
import { CONTENT as cssNesting } from './css-nesting.js';
import { CONTENT as symbols, CONTENT_WITHOUT_SYMBOLS } from './symbols.js';
import { CONTENT as contentBindings } from './content-bindings';
import { CONTENT as symbolBindings } from './symbol-bindings';
import { CONTENT as image } from './image.js';
import { CONTENT as dataBindings } from './data-bindings.js';
import { CONTENT as dataBindingStyles } from './data-binding-styles.js';
import {
  CONTENT as customBreakpoints,
  CONTENT_RESET as customBreakpointsReset,
} from './custom-breakpoints.js';
import { CONTENT as reactiveState } from './reactive-state';
import { CONTENT as showHideIf } from './show-hide-if';
import { CONTENT as textBlock } from './text-block';
import type { BuilderContent } from './types.js';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

const getPathnameFromWindow = (): string => (isBrowser() ? window.location.pathname : '');

const pages = {
  '/': homepage,
  '/can-track-false': homepage,
  '/css-nesting': cssNesting,
  '/columns': columns,
  '/symbols': symbols,
  '/symbols-without-content': CONTENT_WITHOUT_SYMBOLS,
  '/symbol-bindings': symbolBindings,
  '/content-bindings': contentBindings,
  '/image': image,
  '/data-bindings': dataBindings,
  '/data-binding-styles': dataBindingStyles,
  '/custom-breakpoints': customBreakpoints,
  '/reactive-state': reactiveState,
  '/element-events': elementEvents,
  '/show-hide-if': showHideIf,
  '/custom-breakpoints-reset': customBreakpointsReset,
  '/text-block': textBlock,
} as const;

export type Path = keyof typeof pages;

export const ALL_PATHNAMES = Object.keys(pages);

const getContentForPathname = (pathname: string): BuilderContent | null =>
  pages[pathname as keyof typeof pages] || null;

// remove trailing slash from pathname if it exists
// unless it's the root path
const normalizePathname = (pathname: string): string =>
  pathname === '/' ? pathname : pathname.replace(/\/$/, '');

export const getAPIKey = (): string => 'abcd';

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
    apiKey: getAPIKey(),
    model: 'page',
    ...extraProps,
  };
};
