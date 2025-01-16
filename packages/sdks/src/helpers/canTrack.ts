import { checkIsDefined } from './nullable.js';
import { userAttributesSubscriber } from './user-attributes.js';

export const getDefaultCanTrack = (canTrack?: boolean) => {
  const result = checkIsDefined(canTrack) ? canTrack : true;
  userAttributesSubscriber.setCanTrack(result);
  return result;
};
