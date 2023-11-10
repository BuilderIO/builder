import r from 'isolated-vm';
const c = (e) => {
  const t = new r.Isolate({ memoryLimit: 128 }).createContextSync().evalSync(e);
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
};
export { c as evaluator };
