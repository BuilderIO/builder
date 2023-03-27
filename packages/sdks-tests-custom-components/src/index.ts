import { default as Button } from './button.lite';
import type { RegisteredComponent } from '@builder.io/sdks/src/context/types';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

const getPathnameFromWindow = (): string => (isBrowser() ? window.location.pathname : '');

// remove trailing slash from pathname if it exists
// unless it's the root path
const normalizePathname = (pathname: string): string =>
  pathname === '/' ? pathname : pathname.replace(/\/$/, '');

export const getCustomComponents = (_pathname = getPathnameFromWindow()): RegisteredComponent[] => {
  const pathname = normalizePathname(_pathname);

  switch (pathname) {
    case '/custom-core-button':
      console.log('custom-core-button returned');
      return [{ component: Button, name: 'Core:Button' }];
    default:
      return [];
  }
};
