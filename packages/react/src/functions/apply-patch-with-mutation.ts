export const applyPatchWithMinimalMutationChain = (
  obj: any,
  patch: { path: string; op: 'add' | 'remove' | 'replace'; value: any },
  preserveRoot = true
) => {
  if (Object(obj) !== obj) {
    return obj
  }
  const { path, op, value } = patch
  const pathArr: string[] = path.split(/\//)

  const newObj = preserveRoot ? obj : { ...obj }
  let objPart = newObj
  for (let i = 0; i < pathArr.length; i++) {
    const isLast = i === pathArr.length - 1
    const property = pathArr[i]
    if (isLast) {
      if (op === 'replace') {
        objPart[property] = value
      } else if (op === 'add') {
        const index = Number(property)
        if (Array.isArray(objPart)) {
          if (property === '-') {
            objPart.push(value)
          } else {
            objPart.splice(index - 1, 0, value)
          }
        } else {
          objPart[property] = value
        }
      } else if (op === 'remove') {
        const index = Number(property)
        if (Array.isArray(objPart)) {
          objPart.splice(index, 1, value)
        } else {
          delete objPart[property]
        }
      }
    } else {
      objPart = objPart[property] = {
        ...(Object(objPart[property]) === objPart[property]
          ? objPart[property]
          : String(Number(property)) === property
          ? []
          : {})
      }
    }
  }

  return newObj
}