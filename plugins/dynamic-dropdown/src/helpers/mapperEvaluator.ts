const safeEvaluate = (code: string, context: any = {}) => {
  let result = null;
  try {
    const fn = new Function(`return ${code}`)();
    result = fn(context);
  } catch (e) {
    console.error('safeEvaluate error: ', e);
  }

  return result;
};

export { safeEvaluate };
