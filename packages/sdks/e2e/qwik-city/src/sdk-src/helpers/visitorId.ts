import type { CanTrack } from '../types/can-track';
import { getLocalStorageItem, setLocalStorageItem } from './localStorage';
import { checkIsDefined } from './nullable';
import { uuid } from './uuid';
const VISITOR_LOCAL_STORAGE_KEY = 'builderVisitorId';
export const getVisitorId = ({ canTrack }: CanTrack): string | undefined => {
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
    setVisitorId({
      id: newVisitorId,
      canTrack,
    });
    return newVisitorId;
  }
};
export const createVisitorId = () => uuid();
export const setVisitorId = ({
  id,
  canTrack,
}: {
  id: string;
} & CanTrack) =>
  setLocalStorageItem({
    key: VISITOR_LOCAL_STORAGE_KEY,
    value: id,
    canTrack,
  });
