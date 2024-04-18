export const MSG_PREFIX = '[Builder.io]: ';
export const logger = {
  log: (...message: any[]) => console.log(MSG_PREFIX, ...message),
  error: (...message: any[]) => console.error(MSG_PREFIX, ...message),
  warn: (...message: any[]) => console.warn(MSG_PREFIX, ...message),
  debug: (...message: any[]) => console.debug(MSG_PREFIX, ...message),
};
