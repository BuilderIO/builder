import { checkIsDefined } from './nullable.js';
import { userAttributesService } from './user-attributes.js';

export const getDefaultCanTrack = (canTrack?: boolean) => {
  const result = checkIsDefined(canTrack) ? canTrack : true;
  userAttributesService.setCanTrack(result);
  return result;
};
