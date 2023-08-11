import { getCookie, setCookie } from "./cookie.js";
const BUILDER_STORE_PREFIX = "builderio.variations";
const getContentTestKey = (id) => `${BUILDER_STORE_PREFIX}.${id}`;
const getContentVariationCookie = ({
  contentId,
  canTrack
}) => getCookie({ name: getContentTestKey(contentId), canTrack });
const setContentVariationCookie = ({
  contentId,
  canTrack,
  value
}) => setCookie({ name: getContentTestKey(contentId), value, canTrack });
export {
  getContentVariationCookie,
  setContentVariationCookie
};
