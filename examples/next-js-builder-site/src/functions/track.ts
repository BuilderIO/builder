import throttle from 'lodash/throttle';
import defaults from 'lodash/defaults';
import amplitude from 'amplitude-js';
import * as Sentry from '@sentry/browser';
import { Builder } from '@builder.io/react';
import { getReferrerCookie, getCookie } from '../scripts/init-referrer-cookie';

export const isDev = [
  'localhost',
  'local.builder.io',
  'local-qa.builder.io',
].includes(window.location.hostname);

const noTrack = Builder.isPreviewing || Builder.isEditing;

amplitude.getInstance().init('2532be1b0436a18cb938b21fc7fa9faf');

if (!isDev) {
  Sentry.init({
    dsn: 'https://b243dcca3929490989f3bbc6f248dd21@sentry.io/258943',
  });
}

const userId = getCookie('builder.userId');

if (userId) {
  amplitude.getInstance().setUserId(userId);
  const { FS } = window as any;
  if (FS) {
    FS.identify(userId);
  }
}

function findAllParents(
  target: HTMLElement | SVGElement,
  callback: (element: HTMLElement | SVGElement) => boolean,
  checkElement = true,
): (HTMLElement | SVGElement)[] {
  const parents: (HTMLElement | SVGElement)[] = [];
  if (!(target instanceof HTMLElement || target instanceof SVGElement)) {
    return parents;
  }
  let parent: HTMLElement | SVGElement | null = checkElement
    ? target
    : target.parentElement;
  do {
    if (!parent) {
      return parents;
    }

    const matches = callback(parent);
    if (matches) {
      parents.push(parent);
    }
  } while ((parent = parent.parentElement));

  return parents;
}

addEventListener(
  'mousedown',
  (event) => {
    const { target } = event;

    const TRACK_ATTRIBUTE = 'data-name';

    // TODO: track a[href] as well...? Selector for my own internal heatmaps?
    if (target instanceof HTMLElement || target instanceof SVGElement) {
      // data-uid, data-key, data-handle? key=? track=? handle=? uid=? bid=? b-id?
      const parents = findAllParents(
        target,
        (el) => el && !!el.getAttribute(TRACK_ATTRIBUTE),
      );
      for (const parent of parents) {
        track('interaction', {
          type: 'mousedown',
          name: parent.getAttribute(TRACK_ATTRIBUTE),
        });
      }

      const aParents = findAllParents(target, (el) =>
        Boolean(el instanceof HTMLAnchorElement && el.href),
      ) as HTMLAnchorElement[];
      for (const parent of aParents) {
        track('interaction', {
          type: 'clickLink',
          detail: parent.getAttribute('href'),
          kind: parent.getAttribute('target'),
          text: parent.innerText.substring(0, 100),
        });
      }
    }
  },
  { passive: true, capture: true },
);

addEventListener('error', (err) => {
  if (isDev) {
    return;
  }
  track('error', {
    message: err.message,
    error: err.error && err.error.message,
    stack: err.error && err.error.stack,
    errorLocation: `${err.filename || (err as any).source}:${err.lineno}:${
      err.colno
    }`,
  });
});

export const fastClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

const DEBUG_TRACKING = isDev;

interface Event {
  name: string;
  data: any;
}
let eventQueue: Event[] = [];

// TODO: share with app somehow
const sessionId = Math.random().toString(36).split('.')[1];

export function track(name: string, data = {} as any) {
  if (isDev || noTrack) {
    if (DEBUG_TRACKING) {
      console.debug('track:', name, data);
    }
    return false;
  }
  data = fastClone(data);

  const { Intercom, gtag, FS } = window as any;

  // Add these to top level in bigquery (?)
  data = defaults(data, {
    userId,
    url: location.href,
    app: 'site',
    host: location.hostname,
    // TODO: get user data from firebase for tracking
    sessionId,
    // TODO
    // organizationId: appState.user.organization && appState.user.organization.value.id,
    userLoggedIn: Boolean(userId),
    initialReferrer: getReferrerCookie(),
    timestamp: Date.now(),
    date: new Date().toUTCString(),
    sessionUrl:
      FS &&
      typeof FS.getCurrentSessionURL === 'function' &&
      FS.getCurrentSessionURL(true),
  });

  trackInternal(name, data);

  amplitude.logEvent(name, data);

  if (FS && typeof FS.event === 'function') {
    FS.event(name, fastClone(data));
  }

  const _hsq = ((window as any)._hsq = (window as any)._hsq || []);

  if (name === 'pageView') {
    _hsq.push(['trackPageView']);
  } else {
    _hsq.push(['trackEvent', { id: name }]);
  }

  if (typeof Intercom === 'function') {
    Intercom('trackEvent', name, data);
    if (name === 'pageView') {
      Intercom('update');
    }
  }
  if (typeof gtag === 'function') {
    gtag('send', {
      hitType: 'event',
      eventCategory: 'Site',
      eventAction: name,
    });
  }

  return true;
}

export function trackInternal(name: string, data?: any) {
  if (isDev) {
    return false;
  }
  eventQueue.push({ name, data: flattenObject(data || {}) });
  throttledClearInternalQueue();
  return true;
}

const throttledClearInternalQueue = throttle(
  () => {
    if (!eventQueue.length) {
      return;
    }
    const queue = eventQueue.slice();
    eventQueue = [];
    return fetch('https://builder.io/api/v1/event', {
      method: 'POST',
      body: JSON.stringify({ events: queue }),
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
    });
  },
  500,
  { leading: false, trailing: true },
);

function flattenObject(
  obj: any,
  _current?: any,
  _returnObject: any = {},
): { [key: string]: string } {
  for (const key in obj) {
    const value = obj[key];
    const newKey = _current ? `${_current}.${key}` : key;
    if (value && typeof value === 'object') {
      flattenObject(value, newKey, _returnObject);
    } else {
      _returnObject[newKey] = value;
    }
  }

  return _returnObject;
}

function addAdditionalScripts() {
  // Don't load when speed testing on chrome litehouse
  if (navigator.userAgent.match(/chrome-lighthouse|Google Page Speed/i)) {
    return;
  }

  // Only add hubspot if there is a userId, or else we don't track anything
  if (getCookie('builder.userId')) {
    const hubspotScript = document.createElement('script');

    hubspotScript.type = 'text/javascript';
    hubspotScript.id = 'hs-script-loader';
    hubspotScript.async = true;
    hubspotScript.defer = true;
    hubspotScript.src = '//js.hs-scripts.com/5149643.js';
    document.body.appendChild(hubspotScript);
  }

  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.defer = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=UA-108006325-1';
  document.body.appendChild(gtagScript);
}

if (Builder.isBrowser) {
  addAdditionalScripts();
}
