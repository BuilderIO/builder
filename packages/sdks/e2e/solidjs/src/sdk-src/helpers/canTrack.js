import { checkIsDefined } from "./nullable.js";

const getDefaultCanTrack = canTrack => checkIsDefined(canTrack) ? canTrack : true;

export { getDefaultCanTrack }