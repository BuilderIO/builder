export function changeFunctionToString<FN extends (...args: any[]) => any>(
  fn: FN
): string {
  return `return (${fn.toString()}).apply(this, arguments)`;
}
