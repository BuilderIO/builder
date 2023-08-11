const serializeFn = (fnValue) => {
  const fnStr = fnValue.toString().trim();
  const appendFunction = !fnStr.startsWith("function") && !fnStr.startsWith("(");
  return `return (${appendFunction ? "function " : ""}${fnStr}).apply(this, arguments)`;
};
export {
  serializeFn
};
