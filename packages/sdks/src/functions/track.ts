import { TARGET } from '../constants/target.js';
import { getSessionId } from '../helpers/sessionId.js';
import { getVisitorId } from '../helpers/visitorId.js';
import type { CanTrack } from '../types/can-track.js';
import { isBrowser } from './is-browser.js';
import { isEditing } from './is-editing.js';

interface Event {
  type: 'click' | 'impression';
  data: {
    /**
     * (Optional) The content's ID. Useful if this event pertains to a specific piece of content.
     */
    contentId?: string;
    /**
     * This is the ID of the space that the content belongs to.
     */
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

const getTrackingEventData = async ({
  canTrack,
}: CanTrack): Promise<TrackingData> => {
  if (!canTrack) {
    return { visitorId: undefined, sessionId: undefined };
  }

  const sessionId = await getSessionId({ canTrack });
  const visitorId = getVisitorId({ canTrack });

  return {
    sessionId,
    visitorId,
  };
};

type EventProperties = Pick<Event, 'type'> &
  Pick<Event['data'], 'ownerId' | 'contentId'> & {
    /**
     * This is the ID of the space that the content belongs to.
     */
    orgId: Event['data']['ownerId'];
    /**
     * (Optional) metadata that you want to provide with your event.
     */
    metadata: {
      [index: string]: any;
    };
  };

export type EventProps = EventProperties & CanTrack;

const createEvent = async ({
  type: eventType,
  canTrack,
  orgId,
  contentId,
  metadata,
}: EventProps): Promise<Event> => ({
  type: eventType,
  data: {
    metadata: JSON.stringify(metadata),
    ...(await getTrackingEventData({ canTrack })),
    ownerId: orgId,
    contentId,
  },
});

export async function track(eventProps: EventProps) {
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
      events: [await createEvent(eventProps)],
    }),
    headers: {
      'content-type': 'application/json',
    },
    mode: 'cors',
  }).catch((err) => {
    console.error('Failed to track: ', err);
  });
}

export const trackExternal = (args: EventProperties) =>
  track({ ...args, canTrack: true });
