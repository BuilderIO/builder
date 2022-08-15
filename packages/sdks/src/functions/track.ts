import { TARGET } from '../constants/target.js';
import { getSessionId } from '../helpers/sessionId.js';
import { getVisitorId } from '../helpers/visitorId.js';
import { CanTrack } from '../types/can-track.js';
import { isBrowser } from './is-browser.js';
import { isEditing } from './is-editing.js';

interface Event {
  type: 'click' | 'impression';
  data: {
    contentId?: string;
    ownerId: string;
    metadata?: string;
    sessionId: string | undefined;
    visitorId: string | undefined;
    [index: string]: any;
  };
}

type TrackingData = {
  visitorId: string | undefined;
  sessionId: string | undefined;
};

const getTrackingEventData = ({ canTrack }: CanTrack): TrackingData => {
  if (!canTrack) {
    return { visitorId: undefined, sessionId: undefined };
  }

  const sessionId = getSessionId({ canTrack });
  const visitorId = getVisitorId({ canTrack });

  return {
    sessionId,
    visitorId,
  };
};

type EventProperties = {
  type: Event['type'];
  orgId: Event['data']['ownerId'];
  contentId: Event['data']['contentId'];
  [index: string]: any;
};

export type EventProps = EventProperties & CanTrack;

const createEvent = ({
  type: eventType,
  canTrack,
  orgId,
  contentId,
  ...properties
}: EventProps): Event => ({
  type: eventType,
  data: {
    ...properties,
    ...getTrackingEventData({ canTrack }),
    ownerId: orgId,
    contentId,
  },
});

export function track(eventProps: EventProps) {
  if (!eventProps.canTrack) {
    return;
  }

  if (isEditing()) {
    return;
  }
  if (!(isBrowser() || TARGET === 'reactNative')) {
    return;
  }

  return fetch(`https://builder.io/api/v1/track`, {
    method: 'POST',
    body: JSON.stringify({
      events: [createEvent(eventProps)],
    }),
    headers: {
      'content-type': 'application/json',
    },
    mode: 'cors',
  });
}
