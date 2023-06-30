/**
 * @credit https://stackoverflow.com/a/2117523
 */
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Slightly cleaner and smaller UUIDs
 */
export function uuid() {
  return uuidv4().replace(/-/g, '');
}
