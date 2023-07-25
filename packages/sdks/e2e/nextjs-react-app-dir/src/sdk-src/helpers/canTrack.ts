import { checkIsDefined } from './nullable';
export const getDefaultCanTrack = (canTrack?: boolean) => checkIsDefined(canTrack) ? canTrack : true