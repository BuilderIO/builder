'use client';
import React from 'react';
import { Builder } from '@builder.io/sdk';
import { withBuilder } from '../functions/with-builder';

class EmbedComponent extends React.Component<any> {
  elementRef: HTMLElement | null = null;

  scriptsInserted = new Set();
  scriptsRun = new Set();

  componentDidUpdate(prevProps: any) {
    if (this.props.content !== prevProps.content) {
      this.findAndRunScripts();
    }
  }

  componentDidMount() {
    this.findAndRunScripts();
  }

  findAndRunScripts() {
    if (this.elementRef && typeof window !== 'undefined') {
      const scripts = this.elementRef.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.src) {
          if (this.scriptsInserted.has(script.src)) {
            continue;
          }
          this.scriptsInserted.add(script.src);
          const newScript = document.createElement('script');
          newScript.async = true;
          newScript.src = script.src;
          document.head.appendChild(newScript);
        } else {
          if (this.scriptsRun.has(script.innerText)) {
            continue;
          }
          this.scriptsRun.add(script.innerText);
          try {
            new Function(script.innerText)();
          } catch (error) {
            console.warn('Builder custom code component error:', error);
          }
        }
      }
    }
  }

  get content() {
    // Remove scripts on server - if they manipulate dom there can be issues on hydration
    // TODO: allow this to by bypassed by context or prop that says if this is going to be HTML
    // loaded without client JS/hydration (static)
    if (Builder.isServer) {
      return (this.props.content || '').replace(/<script[\s\S]*?<\/script>/g, '');
    }
    return this.props.content;
  }

  render() {
    return (
      <div
        ref={ref => (this.elementRef = ref)}
        className="builder-embed"
        dangerouslySetInnerHTML={{ __html: this.content }}
      />
    );
  }
}

export const Embed = withBuilder(EmbedComponent, {
  name: 'Embed',
  static: true,
  inputs: [
    {
      name: 'url',
      type: 'url',
      required: true,
      defaultValue: '',
      helperText: 'e.g. enter a youtube url, google map, etc',
      onChange(options: Map<string, any>) {
        let url = options.get('url');

        if (url) {
          const fetchHtmlContentForUrl = (url: string) => {
            // TODO: get this out of here!
            const apiKey = 'ae0e60e78201a3f2b0de4b';

            return fetch(`https://iframe.ly/api/iframely?url=${url}&api_key=${apiKey}`)
              .then(res => res.json())
              .then(data => {
                if (data.html) {
                  return data.html;
                } else {
                  return 'Invalid url, please try another';
                }
              })
              .catch(ex => {
                console.error(`Error fetching content for url 'url' !`, ex);
                return 'There was an error embedding this URL, please try again or another URL';
              });
          };

          options.set('content', 'Loading...');

          if (typeof url === 'string') {
            fetchHtmlContentForUrl(url).then(content => options.set('content', content));
          } else {
            // if url is an observable, extract the core url map
            if (url.toJS) {
              url = url.toJS();
              url = Object.fromEntries(url.entries());
            }

            if (url['@type'] !== '@builder.io/core:LocalizedValue') {
              console.error("Unrecognized object format for Embed component's 'url' input!", url);
              return;
            }

            const localeEntries: Record<string, string> = Object.assign({}, url);
            delete localeEntries['@type'];

            const fetchedContent = {};

            Promise.all(
              Object.entries(localeEntries).map(([locale, url]) => {
                return fetchHtmlContentForUrl(url).then(
                  content => (fetchedContent[locale] = content)
                );
              })
            ).then(() => {
              options.set(
                'content',
                Object.assign(
                  {
                    '@type': '@builder.io/core:LocalizedValue',
                  },
                  fetchedContent
                )
              );
            });
          }
        } else {
          options.delete('content');
        }
      },
    },
    {
      name: 'content',
      type: 'html',
      defaultValue: `<div style="padding: 20px; text-align: center">(Choose an embed URL)<div>`,
      hideFromUI: true,
    },
  ],
});
