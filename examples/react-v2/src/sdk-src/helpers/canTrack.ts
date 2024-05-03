import { checkIsDefined } from './nullable.js';
export const getDefaultCanTrack = (canTrack?: boolean) => checkIsDefined(canTrack) ? canTrack : true