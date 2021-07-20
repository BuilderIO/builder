import { isReactNative } from './is-react-native';

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined' && !isReactNative();
}
