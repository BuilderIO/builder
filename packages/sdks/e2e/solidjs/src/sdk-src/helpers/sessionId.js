var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = value => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };

    var rejected = value => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };

    var step = x => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);

    step((generator = generator.apply(__this, __arguments)).next());
  });
};

import { getCookie, setCookie } from "./cookie.js";
import { checkIsDefined } from "./nullable.js";
import { uuid } from "./uuid.js";
const SESSION_LOCAL_STORAGE_KEY = "builderSessionId";

const getSessionId = _0 => __async(void 0, [_0], function* ({
  canTrack
}) {
  if (!canTrack) {
    return void 0;
  }

  const sessionId = yield getCookie({
    name: SESSION_LOCAL_STORAGE_KEY,
    canTrack
  });

  if (checkIsDefined(sessionId)) {
    return sessionId;
  } else {
    const newSessionId = createSessionId();
    setSessionId({
      id: newSessionId,
      canTrack
    });
    return newSessionId;
  }
});

const createSessionId = () => uuid();

const setSessionId = ({
  id,
  canTrack
}) => setCookie({
  name: SESSION_LOCAL_STORAGE_KEY,
  value: id,
  canTrack
});

export { createSessionId, getSessionId, setSessionId }