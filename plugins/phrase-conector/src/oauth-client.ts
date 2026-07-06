/**
 * @builder.io/plugin-phrase-connector — browser OAuth helper
 *
 * Opens a popup that points at the Builder API monolith
 * (`/api/v1/memsource/oauth/start`). The server redirects to Phrase
 * (`https://[us.]cloud.memsource.com/web/oauth/authorize`), and on
 * callback persists tokens against the org's plugin settings.
 *
 * The popup `postMessage`s a result object back to the opener so the
 * settings page can reactively re-render.
 */
import appState from '@builder.io/app-context';
import pkg from '../package.json';

const PLUGIN_ID = pkg.name;

export type PhraseOAuthTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
  tokenType: 'Bearer';
  connectedAt: number;
  userUid?: string;
};

export function isOAuthValid(oauth?: PhraseOAuthTokens | null): boolean {
  if (!oauth?.accessToken) return false;
  if (oauth.expiresAt <= Date.now()) return false;
  // Valid = we have an access token that has not yet expired.
  return true;
}

// Bridges the window between a successful connect and the next full org
// reload: the server persists the real token to Firestore, but the client's
// in-memory org settings won't carry it until reload. This client-only
// marker lets ensureAuthenticated() proceed meanwhile. It is never persisted,
// so it cannot clobber the server-held access token.
export const sessionOAuth: { value: { expiresAt: number; connectedAt?: number } | null } = {
  value: null,
};

function getApiHost(override?: string): string {
  if (override) return override;
  const orgSettings: any =
    appState.user.organization?.value?.settings?.plugins?.get?.(PLUGIN_ID) || {};
  return orgSettings.apiHost || 'https://cdn.builder.io';
}


export async function disconnectOAuth(opts: { apiHost?: string } = {}): Promise<void> {
  const apiHost = getApiHost(opts.apiHost);
  const privateKey = await appState.globalState.getPluginPrivateKey(PLUGIN_ID);
  const params = new URLSearchParams({ apiKey: appState.user.apiKey, pluginId: PLUGIN_ID });
  const res = await fetch(apiHost + "/api/v1/memsource/oauth/disconnect?" + params, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + privateKey,
    },
  });
  if (!res.ok) {
    throw new Error("Could not disconnect from Phrase. Please try again.");
  }
  sessionOAuth.value = null;
}

export async function connectWithOAuth(opts: {
  isUSDataCenterAccount: boolean;
  apiHost?: string;
  clientId?: string;
}): Promise<{ connectedAt?: number; expiresAt?: number }> {
  const apiHost = getApiHost(opts.apiHost);
  const privateKey = await appState.globalState.getPluginPrivateKey(PLUGIN_ID);

  // Mint a one-time, server-stored state (authenticated) instead of passing
  // apiKey/pluginId through the public query string.
  const prepareParams = new URLSearchParams({
    apiKey: appState.user.apiKey,
    pluginId: PLUGIN_ID,
  });
  const prepareRes = await fetch(
    apiHost + "/api/v1/memsource/oauth/prepare?" + prepareParams,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + privateKey,
      },
      body: JSON.stringify({
        isUS: !!opts.isUSDataCenterAccount,
        origin: window.location.origin,
        clientId: opts.clientId,
      }),
    }
  );
  if (!prepareRes.ok) {
    throw new Error("Could not start Phrase OAuth. Please try again.");
  }
  const { stateId } = await prepareRes.json();
  if (!stateId) {
    throw new Error("Could not start Phrase OAuth. Please try again.");
  }

  const url =
    apiHost + "/api/v1/memsource/oauth/start?state=" + encodeURIComponent(stateId);
  const popup = window.open(
    url,
    "phrase-oauth",
    "width=560,height=720,menubar=no,toolbar=no,location=no"
  );
  if (!popup) throw new Error("Popup blocked. Allow popups for this site and try again.");

  let expectedOrigin = "";
  try {
    expectedOrigin = new URL(apiHost).origin;
  } catch {}

  return await new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      clearInterval(closedTimer);
    };
    const onMessage = (e: MessageEvent) => {
      if (expectedOrigin && e.origin !== expectedOrigin) return;
      const data = e.data ? e.data : {};
      if (data?.type !== "memsource-oauth-result") return;
      if (e.source !== popup) return;
      settled = true;
      cleanup();
      try {
        popup.close();
      } catch {}
      if (data.error) {
        reject(new Error(data.error));
      } else {
        const connection = data.connection ? data.connection : {};
        if (connection.expiresAt) {
          sessionOAuth.value = {
            expiresAt: connection.expiresAt,
            connectedAt: connection.connectedAt,
          };
        }
        resolve(connection);
      }
    };
    window.addEventListener("message", onMessage);
    const closedTimer = setInterval(() => {
      if (settled) return;
      if (popup.closed) {
        cleanup();
        reject(new Error("OAuth window closed before completion"));
      }
    }, 500);
  });
}
