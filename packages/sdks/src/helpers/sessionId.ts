import { CanTrack } from '../types/can-track';
import { getCookie, setCookie } from './cookie';
import { checkIsDefined } from './nullable';
import { uuid } from './uuid';

const SESSION_LOCAL_STORAGE_KEY = 'builderSessionId';

export const getSessionId = ({ canTrack }: CanTrack) => {
  if (!canTrack) {
    return undefined;
  }

  const sessionId = getCookie({ name: SESSION_LOCAL_STORAGE_KEY, canTrack });

  if (checkIsDefined(sessionId)) {
    return sessionId;
  } else {
    const newSessionId = createSessionId();
    setSessionId({ id: newSessionId, canTrack });
  }
};

export const createSessionId = () => uuid();

export const setSessionId = ({
  id,
  canTrack,
}: {
  id: string;
  canTrack: boolean;
}) => setCookie({ name: SESSION_LOCAL_STORAGE_KEY, value: id, canTrack });
