/**
 * @builder.io/plugin-phrase-connector — browser API wrapper
 *
 * Talks to the Builder API monolith. The server holds the OAuth tokens
 * (or legacy username/password) and forwards calls to Phrase TMS.
 *
 * Endpoints used:
 *   POST /api/v1/memsource/job
 *   POST /api/v1/memsource/apply-translation
 *   POST /api/v1/memsource/oauth/refresh   (auto-invoked on 401)
 */
import { action } from 'mobx';
import appState from '@builder.io/app-context';
import pkg from '../package.json';
import { getSessionOAuth, isOAuthValid, isSessionDisconnected, readOrgPluginSetting } from './oauth-client';

const PLUGIN_ID = pkg.name;


export type Project = { uid: string };

export class PhraseApi {
  private privateKey?: string;
  private loaded: Promise<void>;
  private resolveLoaded!: () => void;
  // Bumped on every init() so a stale in-flight init (e.g. from before an
  // org switch) cannot assign the previous org's key or resolve the current
  // loaded promise.
  private initEpoch = 0;

  constructor(private settings: any) {
    this.loaded = new Promise(resolve => (this.resolveLoaded = resolve));
    this.init();
    appState.globalState.orgSwitched?.subscribe(
      action(async () => {
        // Session markers are keyed by apiKey (see oauth-client), so they don't
        // leak across orgs and nothing needs resetting here on switch.
        this.loaded = new Promise(resolve => (this.resolveLoaded = resolve));
        await this.init();
      })
    );
  }

  private get apiHost(): string {
    return this.settings.get('apiHost') || 'https://cdn.builder.io';
  }

  private buildUrl(path: string, search: Record<string, string> = {}) {
    const params = new URLSearchParams({
      ...search,
      pluginId: PLUGIN_ID,
      apiKey: appState.user.apiKey,
    });
    const url = new URL(`${this.apiHost}/api/v1/memsource/${path}`);
    url.search = params.toString();
    return url.toString();
  }

  private async init() {
    const epoch = ++this.initEpoch;
    const key = await appState.globalState.getPluginPrivateKey(PLUGIN_ID);
    // A newer init() started while we were awaiting; let it win.
    if (epoch !== this.initEpoch) return;
    this.privateKey = key;
    this.resolveLoaded();
  }

  /**
   * Verifies that the plugin has a usable credential before issuing API
   * requests. For OAuth mode the server handles refresh transparently;
   * we only check that *some* form of credentials exists.
   */
  async ensureAuthenticated() {
    await this.loaded;
    const notConnected =
      'Phrase is not connected. Please click "Connect to Phrase" in plugin settings.';

    // The real access token lives server-side; the client only ever sees
    // connection metadata. The session marker (set by connectWithOAuth) is the
    // reliable signal of a fresh connect this session, since the persisted
    // authMode may not have propagated to the in-memory org model yet.
    const sessionOauth = getSessionOAuth();
    // Decide by persisted authMode; only let the live session marker force
    // OAuth when authMode is unset (a first-ever connect whose mode hasn't
    // been saved yet). Never let it override an explicit 'password'.
    const persistedMode = readOrgPluginSetting('authMode');
    const isOAuthMode = persistedMode === 'oauth' || (!persistedMode && !!sessionOauth);

    if (!isOAuthMode) {
      if (!readOrgPluginSetting('userName') || !readOrgPluginSetting('password')) {
        throw new Error('Phrase username/password is not configured.');
      }
      return;
    }

    // Disconnect leaves stale oauth metadata on the org model until it reloads;
    // don't treat that as connected. Markers are apiKey-scoped.
    if (isSessionDisconnected() && !sessionOauth) {
      throw new Error(notConnected);
    }
    // Prefer whichever candidate has the later expiry so a fresh reconnect isn't
    // blocked by stale org OAuth metadata left over from before it.
    const oauth = [readOrgPluginSetting('oauth'), sessionOauth]
      .filter(Boolean)
      .reduce(
        (best: any, c: any) => (best && best.expiresAt >= (c?.expiresAt ?? 0) ? best : c),
        null
      );
    if (!isOAuthValid(oauth)) {
      throw new Error(oauth ? 'Phrase OAuth session expired. Please reconnect.' : notConnected);
    }
  }

  private async request(path: string, init?: RequestInit, search = {}) {
    await this.loaded;
    const doFetch = () =>
      fetch(this.buildUrl(path, search), {
        ...init,
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });

    let res = await doFetch();
    if (res.status === 401) {
      const persistedMode = readOrgPluginSetting('authMode');
      const isOAuthMode = persistedMode === "oauth" || (!persistedMode && !!getSessionOAuth());
      if (isOAuthMode) {
        // Ask the server to refresh the token, then retry once. If the refresh
        // itself failed (e.g. no refresh token -> reconnect needed), surface
        // that reason instead of retrying and reporting a misleading API error.
        const refreshRes = await fetch(this.buildUrl('oauth/refresh'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.privateKey}` },
        });
        if (!refreshRes.ok) {
          const info = await refreshRes.json().catch(() => ({} as any));
          throw new Error(info?.error || 'Phrase session expired. Please reconnect.');
        }
        res = await doFetch();
      }
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Phrase API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  createJob(
    contentId: string,
    model: string,
    sourceLang: string,
    targetLangs: string[],
    callbackHost?: string
  ): Promise<{ project: Project }> {
    return this.request('job', {
      method: 'POST',
      body: JSON.stringify({ contentId, model, sourceLang, targetLangs, callbackHost }),
    });
  }

  applyTranslation(contentId: string, model: string) {
    return this.request('apply-translation', {
      method: 'POST',
      body: JSON.stringify({ contentId, model }),
    });
  }
}
