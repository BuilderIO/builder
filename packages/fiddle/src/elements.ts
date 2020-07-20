import { version } from '../package.json';

const isBrowser = typeof window !== 'undefined';

export const delay = <ResolveType = void>(ms = 0, value?: ResolveType, reject = false) =>
  new Promise<ResolveType>((resolve, _reject) =>
    setTimeout(() => (reject ? _reject(value) : resolve(value)), ms)
  );

const globalLoadedVar = 'BuilderFiddleLoaded';

const globalVar: any =
  typeof window !== 'undefined'
    ? window
    : typeof self !== 'undefined'
    ? self
    : typeof global !== 'undefined'
    ? global
    : this;

if (isBrowser && !globalVar[globalLoadedVar]) {
  globalVar[globalLoadedVar] = true;

  // Use this for wordpress + shopify
  class BuilderFiddle extends HTMLElement {
    iframeRef: HTMLIFrameElement | null = null;

    entry?: string;

    VERSION = version;

    ready = false;

    onReadyHandles: Function[] = [];

    get loaded() {
      return this.ready;
    }

    async waitUntilReady() {
      return new Promise(resolve => {
        if (this.ready) {
          resolve();
        } else {
          this.onReadyHandles.push(resolve);
        }
      });
    }

    connectedCallback() {
      addEventListener('message', this.onWindowMessage);

      const entry = this.getAttribute('entry');
      const cachebust = this.getAttribute('cachebust') === 'true';

      const iframe = document.createElement('iframe');

      const dev = this.getAttribute('env') === 'dev';
      const beta = this.getAttribute('env') === 'beta';
      const qa = this.getAttribute('env') === 'qa';

      const view = ['', 'true'].includes(this.getAttribute('view')!);

      if (entry) {
        this.entry = entry;
      }

      const host = this.getAttribute('host')
        ? this.getAttribute('host')
        : dev
        ? 'http://localhost:1234'
        : qa
        ? 'https://qa.builder.io'
        : beta
        ? 'https://beta.builder.io'
        : 'https://builder.io';

      const url = host + '/fiddle' + (entry ? '/' + entry : '') + (view ? '/view' : '');

      iframe.src = url;
      this.appendChild(iframe);
      const aspectRatio = this.getAttribute('aspect-ratio') || '65%';
      const useSpacer = this.getAttribute('use-spacer') !== 'false';
      if (useSpacer) {
        const spacer = document.createElement('div');
        spacer.className = 'builder-fiddle-spacer';
        spacer.style.paddingTop = aspectRatio;
        this.append(spacer);
      }
      this.iframeRef = iframe;
      this.injectStyles();
    }

    private onWindowMessage = (event: MessageEvent) => {
      const { data } = event;
      if (data) {
        if (data.type === 'builder.fiddleLoaded') {
          this.doneLoading();
        }
      }
    };

    private doneLoading() {
      if (this.loaded) {
        return;
      }
      this.ready = true;
      this.classList.add('loaded');
      this.dispatchEvent(new CustomEvent('load'));
      this.onReadyHandles.forEach(handler => handler());
    }

    injectStyles() {
      const stylesId = 'builder-fiddle-styles';
      if (document.getElementById(stylesId)) {
        return;
      }

      const useStyles = this.getAttribute('use-styles') !== 'false';
      const style = document.createElement('style');
      style.id = stylesId;
      style.innerHTML = `
        builder-fiddle {
          display: block;
          position: relative
        }

        builder-fiddle iframe {
          position: absolute;

          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;

          min-height: 400px;
          min-width: 600px;
          border: none;
        }
      `;

      if (useStyles) {
        style.innerHTML += `
          builder-fiddle {
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12);
          }
        `;
      }
      document.head!.appendChild(style);
    }

    private messageFrame(name: string, value?: object) {
      if (this.iframeRef && this.iframeRef.contentWindow) {
        this.iframeRef.contentWindow.postMessage(
          {
            type: name,
            data: value,
          },
          '*'
        );
      }
    }

    attributeChangedCallback() {
      // TODO: listen for attr change and respond accordingly - and same with properties
    }

    disconnectedCallback() {
      removeEventListener('message', this.onWindowMessage);
    }
  }
  customElements.define('builder-fiddle', BuilderFiddle);
}
