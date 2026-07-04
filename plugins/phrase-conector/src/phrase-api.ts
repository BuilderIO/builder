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

const PLUGIN_ID = pkg.name;

export type Project = { uid: string };

export class PhraseApi {
  private privateKey?: string;
  private loaded: Promise<void>;
  private resolveLoaded!: () => void;

  constructor(private settings: any) {
    this.loaded = new Promise(resolve => (this.resolveLoaded = resolve));
    this.init();
    appState.globalState.orgSwitched?.subscribe(
      action(async () => {
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
    this.privateKey = await appState.globalState.getPluginPrivateKey(PLUGIN_ID);
    this.resolveLoaded();
  }

  /**
   * Verifies that the plugin has a usable credential before issuing API
   * requests. For OAuth mode the server handles refresh transparently;
   * we only check that *some* form of credentials exists.
   */
  async ensureAuthenticated() {
    await this.loaded;
    const orgSettings: any =
      appState.user.organization?.value?.settings?.plugins?.get?.(PLUGIN_ID) || {};
    if (orgSettings.authMode !== 'oauth') {
      if (!orgSettings.userName || !orgSettings.password) {
        throw new Error('Phrase username/password is not configured.');
      }
      return;
    }
    if (!orgSettings.oauth?.accessToken) {
      throw new Error('Phrase is not connected. Please click "Connect to Phrase" in plugin settings.');
    }
    if (orgSettings.oauth.expiresAt <= Date.now()) {
      throw new Error("Phrase OAuth session expired. Please reconnect.");
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
      const mode = (appState.user.organization?.value?.settings?.plugins?.get?.(PLUGIN_ID) ?? {}).authMode;
      if (mode === "oauth") {
      // Ask the server to refresh the token, then retry once.
      await fetch(this.buildUrl('oauth/refresh'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.privateKey}` },
      });
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
