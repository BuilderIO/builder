export function isDebug(): boolean {
  return Boolean(
    typeof process !== 'undefined' && typeof process.env !== 'undefined' && process.env.DEBUG
  );
}
