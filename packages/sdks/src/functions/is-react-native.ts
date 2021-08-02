export function isReactNative(): boolean {
  return typeof navigator === 'object' && navigator.product === 'ReactNative';
}
