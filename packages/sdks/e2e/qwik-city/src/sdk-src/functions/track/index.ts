import { TARGET } from '../../constants/target.js';
import { getSessionId } from '../../helpers/sessionId.js';
import { getVisitorId } from '../../helpers/visitorId.js';
import type { CanTrack } from '../../types/can-track.js';
import type { Dictionary } from '../../types/typescript.js';
import { isBrowser } from '../is-browser.js';
import { isEditing } from '../is-editing.js';
import { getUserAttributes } from './helpers.js';

interface Event {
  /**
   * The type of your event.
   *
   * Examples: `click`, `conversion`, `pageview`, `impression`
   */
  type: string;
  data: {
    /**
     * (Optional) The content's ID. Useful if this event pertains to a specific piece of content.
     */
    contentId?: string;
    /**
     * This is the ID of the space that the content belongs to.
     */
    ownerId: string;
    /**
     * (Optional) metadata that you want to provide with your event.
     */
    metadata?: Dictionary<any>;
    /**
     * Session ID of the user. This is provided by the SDK by checking session storage.
     */
    sessionId: string | undefined;
    /**
     * Visitor ID of the user. This is provided by the SDK by checking cookies.
     */
    visitorId: string | undefined;
    /**
     * (Optional) If running an A/B test, the ID of the variation that the user is in.
     */
    variationId?: string;
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
  Pick<Event['data'], 'contentId' | 'variationId' | 'metadata'> & {
    /**
     * Your organization's API key.
     */
    apiKey: Event['data']['ownerId'];
    /**
     * (Optional) Any additional (non-metadata) properties to add to the event.
     */
    [index: string]: any;
  };

export type EventProps = EventProperties & CanTrack;

const createEvent = async ({
  type: eventType,
  canTrack,
  apiKey,
  metadata,
  ...properties
}: EventProps): Promise<Event> => ({
  type: eventType,
  data: {
    ...properties,
    metadata: {
      url: location.href,
      ...metadata,
    },
    ...(await getTrackingEventData({ canTrack })),
    userAttributes: getUserAttributes(),
    ownerId: apiKey,
  },
});

export async function _track(eventProps: EventProps) {
  if (!eventProps.apiKey) {
    console.error(
      '[Builder.io]: Missing API key for track call. Please provide your API key.'
    );
    return;
  }

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

export const track = (args: EventProperties) =>
  _track({ ...args, canTrack: true });
