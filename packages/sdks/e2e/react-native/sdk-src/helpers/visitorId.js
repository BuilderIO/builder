import { getLocalStorageItem, setLocalStorageItem } from "./localStorage.js";
import { checkIsDefined } from "./nullable.js";
import { uuid } from "./uuid.js";
const VISITOR_LOCAL_STORAGE_KEY = "builderVisitorId";
const getVisitorId = ({
  canTrack
}) => {
  if (!canTrack) {
    return void 0;
  }
  const visitorId = getLocalStorageItem({
    key: VISITOR_LOCAL_STORAGE_KEY,
    canTrack
  });
  if (checkIsDefined(visitorId)) {
    return visitorId;
  } else {
    const newVisitorId = createVisitorId();
    setVisitorId({
      id: newVisitorId,
      canTrack
    });
    return newVisitorId;
  }
};
const createVisitorId = () => uuid();
const setVisitorId = ({
  id,
  canTrack
}) => setLocalStorageItem({
  key: VISITOR_LOCAL_STORAGE_KEY,
  value: id,
  canTrack
});
export { createVisitorId, getVisitorId, setVisitorId }