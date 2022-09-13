import { getLocalStorageItem, setLocalStorageItem } from './localStorage.js';
import { checkIsDefined } from './nullable.js';
import { uuid } from './uuid.js';

const VISITOR_LOCAL_STORAGE_KEY = 'builderVisitorId';

export const getVisitorId = ({ canTrack }: { canTrack: boolean }) => {
  if (!canTrack) {
    return undefined;
  }

  const visitorId = getLocalStorageItem({
    key: VISITOR_LOCAL_STORAGE_KEY,
    canTrack,
  });

  if (checkIsDefined(visitorId)) {
    return visitorId;
  } else {
    const newVisitorId = createVisitorId();
    setVisitorId({ id: newVisitorId, canTrack });
  }
};

export const createVisitorId = () => uuid();

export const setVisitorId = ({
  id,
  canTrack,
}: {
  id: string;
  canTrack: boolean;
}) =>
  setLocalStorageItem({
    key: VISITOR_LOCAL_STORAGE_KEY,
    value: id,
    canTrack,
  });
