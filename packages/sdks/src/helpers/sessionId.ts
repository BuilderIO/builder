import type { CanTrack } from '../types/can-track.js';
import { getCookie, setCookie } from './cookie.js';
import { checkIsDefined } from './nullable.js';
import { uuid } from './uuid.js';

const SESSION_LOCAL_STORAGE_KEY = 'builderSessionId';

export const getSessionId = async ({
  canTrack,
}: CanTrack): Promise<string | undefined> => {
  if (!canTrack) {
    return undefined;
  }

  const sessionId = await getCookie({
    name: SESSION_LOCAL_STORAGE_KEY,
    canTrack,
  });

  if (checkIsDefined(sessionId)) {
    return sessionId;
  } else {
    const newSessionId = createSessionId();
    setSessionId({ id: newSessionId, canTrack });

    return newSessionId;
  }
};

export const createSessionId = () => uuid();

export const setSessionId = ({
  id,
  canTrack,
}: {
  id: string;
} & CanTrack) =>
  setCookie({ name: SESSION_LOCAL_STORAGE_KEY, value: id, canTrack });
