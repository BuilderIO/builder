export const applyPatchWithMinimalMutationChain = (
  obj: any,
  patch: { path: string; op: 'add' | 'remove' | 'replace'; value: any },
  preserveRoot = true
) => {
  if (Object(obj) !== obj) {
    return obj;
  }
  const { path, op, value } = patch;
  const pathArr: string[] = path.split(/\//);
  if (pathArr[0] === '') {
    pathArr.shift();
  }

  const newObj = preserveRoot ? obj : { ...obj };
  let objPart = newObj;
  for (let i = 0; i < pathArr.length; i++) {
    const isLast = i === pathArr.length - 1;
    const property = pathArr[i];
    if (isLast) {
      if (op === 'replace') {
        objPart[property] = value;
      } else if (op === 'add') {
        const index = Number(property);
        if (Array.isArray(objPart)) {
          if (property === '-') {
            objPart.push(value);
          } else {
            objPart.splice(index, 0, value);
          }
        } else {
          objPart[property] = value;
        }
      } else if (op === 'remove') {
        const index = Number(property);
        if (Array.isArray(objPart)) {
          objPart.splice(index, 1);
        } else {
          delete objPart[property];
        }
      }
    } else {
      const nextProperty = pathArr[i + 1];
      const newPart =
        Object(objPart[property]) === objPart[property]
          ? objPart[property]
          : String(Number(nextProperty)) === nextProperty
          ? []
          : {};
      objPart = objPart[property] = Array.isArray(newPart) ? [...newPart] : { ...newPart };
    }
  }

  return newObj;
};
