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

function getApiHost(): string {
  const orgSettings: any =
    appState.user.organization?.value?.settings?.plugins?.get?.(PLUGIN_ID) || {};
  return orgSettings.apiHost || 'https://cdn.builder.io';
}

export async function connectWithOAuth(opts: {
  isUSDataCenterAccount: boolean;
}): Promise<PhraseOAuthTokens> {
  const apiHost = getApiHost();
  const orgId = appState.user.organization.value.id;
  const apiKey = appState.user.apiKey;
  const stateParam = encodeURIComponent(
    JSON.stringify({
      orgId,
      apiKey,
      pluginId: PLUGIN_ID,
      isUS: !!opts.isUSDataCenterAccount,
      // anti-CSRF nonce
      nonce: Math.random().toString(36).slice(2),
    })
  );
  const url = `${apiHost}/api/v1/memsource/oauth/start?state=${stateParam}`;

  const popup = window.open(
    url,
    'phrase-oauth',
    'width=560,height=720,menubar=no,toolbar=no,location=no'
  );
  if (!popup) throw new Error('Popup blocked. Allow popups for this site and try again.');

  return await new Promise<PhraseOAuthTokens>((resolve, reject) => {
    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      clearInterval(closedTimer);
    };
    const onMessage = (e: MessageEvent) => {
      const data = e.data || {};
      if (data?.type !== 'memsource-oauth-result') return;
      if (e.source !== popup) return;
      cleanup();
      try {
        popup.close();
      } catch {}
      if (data.error) {
        reject(new Error(data.error));
      } else if (data.tokens) {
        resolve(data.tokens as PhraseOAuthTokens);
      } else {
        reject(new Error('Unknown OAuth response'));
      }
    };
    window.addEventListener('message', onMessage);
    const closedTimer = setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error('OAuth window closed before completion'));
      }
    }, 500);
  });
}

export async function disconnectOAuth(): Promise<void> {
  const apiHost = getApiHost();
  const privateKey = await appState.globalState.getPluginPrivateKey(PLUGIN_ID);
  const params = new URLSearchParams({ apiKey: appState.user.apiKey, pluginId: PLUGIN_ID });
  await fetch(apiHost + "/api/v1/memsource/oauth/disconnect?" + params, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + privateKey,
    },
  });
}
