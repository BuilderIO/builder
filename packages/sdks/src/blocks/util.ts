export function markSerializable<FN extends (...args: any[]) => any>(
  fn: FN
): FN {
  (fn as any).__qwik_serializable__ = true;
  return fn;
}
