const MSG_PREFIX = "[Builder.io]: ";
const logger = {
  log: (...message) => console.log(MSG_PREFIX, ...message),
  error: (...message) => console.error(MSG_PREFIX, ...message),
  warn: (...message) => console.warn(MSG_PREFIX, ...message),
  debug: (...message) => console.debug(MSG_PREFIX, ...message)
};
export { logger }