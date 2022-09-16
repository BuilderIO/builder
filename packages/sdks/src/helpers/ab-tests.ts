import { CanTrack } from '../types/can-track.js';
import { getCookie, setCookie } from './cookie.js';
import { uuid } from './uuid.js';

const BUILDER_STORE_PREFIX = 'builder.tests';

const getContentTestKey = (id: string) => `${BUILDER_STORE_PREFIX}.${id}`;

export const getContentVariationCookie = ({
  contentId,
  canTrack,
}: { contentId: string } & CanTrack) =>
  getCookie({ name: getContentTestKey(contentId), canTrack });

export const createSessionId = () => uuid();

export const setContentVariationCookie = ({
  contentId,
  canTrack,
  value,
}: {
  contentId: string;
  value: string;
} & CanTrack) =>
  setCookie({ name: getContentTestKey(contentId), value, canTrack });
