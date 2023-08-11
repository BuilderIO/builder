const set = (obj, _path, value) => {
  if (Object(obj) !== obj) {
    return obj;
  }
  const path = Array.isArray(_path) ? _path : _path.toString().match(/[^.[\]]+/g);
  path.slice(0, -1).reduce((a, c, i) => Object(a[c]) === a[c] ? a[c] : a[c] = Math.abs(Number(path[i + 1])) >> 0 === +path[i + 1] ? [] : {}, obj)[path[path.length - 1]] = value;
  return obj;
};
export {
  set
};
