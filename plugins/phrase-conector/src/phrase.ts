import pkg from '../package.json';
import appState from '@builder.io/app-context';

export type Project = {
  uid: string;
};

export class Phrase {
  private privateKey?: string;
  loaded?: Promise<void>;
  resolveLoaded?: () => void;
  // TODO: basic cache
  getBaseUrl(path: string, search = {}) {
    const params = new URLSearchParams({
      ...search,
      pluginId: pkg.name,
      apiKey: appState.user.apiKey,
    });
    const host = this.apiHost || 'https://cdn.builder.io';
    const baseUrl = new URL(`${host}/api/v1/memsource/${path}`);
    baseUrl.search = params.toString();
    return baseUrl.toString();
  }
  constructor(private apiHost?: string) {
    this.loaded = new Promise(resolve => (this.resolveLoaded = resolve));
    this.init();
  }

  async init() {
    this.privateKey = await appState.globalState.getPluginPrivateKey(pkg.name);
    if (this.privateKey) {
      this.resolveLoaded!();
    }
  }

  async request(path: string, config?: RequestInit, search = {}) {
    let privateKey = await appState.globalState.getPluginPrivateKey(pkg.name);
    await this.loaded;
    return fetch(`${this.getBaseUrl(path, search)}`, {
      ...config,
      headers: {
        Authorization: `Bearer ${privateKey}`,
        'Content-Type': 'application/json',
      },
    }).then(res => res.json());
  }

  createJob(
    contentId: string,
    model: string,
    sourceLang: string,
    targetLangs: string[],
    callbackHost?: string
  ) {
    return this.request('job', {
      method: 'POST',
      body: JSON.stringify({
        contentId,
        model,
        sourceLang,
        targetLangs,
        callbackHost,
      }),
    });
  }

  applyTranslation(contentId: string, model: string) {
    return this.request('apply-translation', {
      method: 'POST',
      body: JSON.stringify({
        contentId,
        model,
      }),
    });
  }
}

function getContentReference(content: any) {
  return {
    content: {
      '@type': '@builder.io/core:Reference',
      id: content.id,
      model: content.modelName,
    },
    preview:
      content.previewUrl || content.meta?.get?.('lastPreviewUrl') || content.meta?.lastPreviewUrl,
  };
}
