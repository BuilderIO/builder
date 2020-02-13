import React from 'react';
// import ReactDOM from 'react-dom'
import { BuilderContent } from './builder-content.component';
import { BuilderBlocks } from './builder-blocks.component';
import {
  Builder,
  GetContentOptions,
  builder,
  Subscription,
  BehaviorSubject,
} from '@builder.io/sdk';
import { BuilderStoreContext } from '../store/builder-store';
import produce from 'immer';
import pick from 'lodash-es/pick';
import throttle from 'lodash-es/throttle';
import size from 'lodash-es/size';
import attempt from 'lodash-es/attempt';
import isError from 'lodash-es/isError';
import debounce from 'lodash-es/debounce';
import { sizes } from '../constants/device-sizes.constant';
import {
  BuilderAsyncRequestsContext,
  RequestOrPromise,
  RequestInfo,
  isRequestInfo,
} from '../store/builder-async-requests';
import { Url } from 'url';
import { debounceNextTick } from '../functions/debonce-next-tick';
import { View } from 'react-native';

const sizeMap = {
  desktop: 'large',
  tablet: 'medium',
  mobile: 'small',
};

function decorator(fn: Function) {
  return function argReceiver(...fnArgs: any[]) {
    // Check if the decorator is being called without arguments (ex `@foo methodName() {}`)
    if (fnArgs.length === 3) {
      const [target, key, descriptor] = fnArgs;
      if (descriptor && (descriptor.value || descriptor.get)) {
        fnArgs = [];
        return descriptorChecker(target, key, descriptor);
      }
    }

    return descriptorChecker;

    // descriptorChecker determines whether a method or getter is being decorated
    // and replaces the appropriate key with the decorated function.
    function descriptorChecker(target: any, key: any, descriptor: any) {
      const descriptorKey = descriptor.value ? 'value' : 'get';
      return {
        ...descriptor,
        [descriptorKey]: fn(descriptor[descriptorKey], ...fnArgs),
      };
    }
  };
}

const Throttle = decorator(throttle);
const fetchCache: { [key: string]: any } = {};

export interface BuilderPageProps {
  modelName?: string;
  name?: string;
  data?: any;
  entry?: string;
  apiKey?: string;
  options?: GetContentOptions;
  contentLoaded?: (data: any) => void;
  contentError?: (error: any) => void;
  content?: any;
  location?: Location | Url;
  onStateChange?: (newData: any) => void;
  noAsync?: boolean;
  emailMode?: boolean;
  inlineContent?: boolean;
}

interface BuilderPageState {
  state: any;
  update: (state: any) => any;
}

const tryEval = (str?: string, data: any = {}, errors?: Error[]): any => {
  const value = str;
  if (!(typeof value === 'string' && value.trim())) {
    return;
  }
  const useReturn = !(value.includes(';') || value.includes(' return '));
  let fn: Function = () => {
    /* Intentionally empty */
  };
  try {
    if (Builder.isBrowser) {
      // tslint:disable-next-line:no-function-constructor-with-string-args
      // TODO: VM in node......
      fn = new Function(
        'state',
        `with (state) {
          ${useReturn ? `return (${value});` : value};
         }`
      );
    }
  } catch (error) {
    if (Builder.isBrowser) {
      console.warn('Could not compile javascript', error);
    } else {
      // Add to req.options.errors to return to client
    }
  }
  try {
    if (Builder.isBrowser) {
      return fn(data || {});
    } else {
      // Below is a hack to get certain code to *only* load in the server build, to not screw with
      // browser bundler's like rollup and webpack. Our rollup plugin strips these comments only
      // for the server build
      // tslint:disable:comment-format
      const { VM } = require('vm2');
      return new VM({
        sandbox: {
          ...data,
          ...{ state: data },
        },
        // TODO: convert reutrn to module.exports on server
      }).run(value.replace(/^return /, ''));
      // tslint:enable:comment-format
    }
  } catch (error) {
    if (errors) {
      errors.push(error);
    }

    if (Builder.isBrowser) {
      console.warn('Builder custom code error:', error.message, 'in', str, error.stack);
    } else {
      console.debug('Builder custom code error:', error.message, 'in', str, error.stack);
      // Add to req.options.errors to return to client
    }
  }

  return;
};

function searchToObject(location: Location | Url) {
  const pairs = (location.search || '').substring(1).split('&');
  const obj: { [key: string]: string } = {};

  for (const i in pairs) {
    if (pairs[i] === '') continue;
    const pair = pairs[i].split('=');
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }

  return obj;
}

export class BuilderPage extends React.Component<BuilderPageProps, BuilderPageState> {
  subscriptions: Subscription = new Subscription();
  onStateChange = new BehaviorSubject<any>(null);

  lastJsCode = '';
  lastHttpRequests = '';

  ref: HTMLElement | null = null;

  get name(): string | undefined {
    return this.props.modelName || this.props.name; // || this.props.model
  }

  private _asyncRequests?: RequestOrPromise[];
  private _errors?: Error[];
  private _logs?: string[];

  constructor(props: BuilderPageProps) {
    super(props);

    this.state = {
      state: {
        location: this.locationState,
        deviceSize: this.deviceSizeState,
        // TODO: will user attributes be ready here?
        device: this.device,
        ...this.props.data,
      },
      update: this.updateState,
    };
  }

  // TODO: pass down with context
  get device() {
    return builder.getUserAttributes().device || 'desktop';
  }

  get locationState() {
    return {
      // TODO: handle this correctly on the server. Pass in with CONTEXT
      ...pick(this.location, 'pathname', 'hostname', 'search', 'host'),
      path: (this.location.pathname && this.location.pathname.split('/').slice(1)) || '',
      query: searchToObject(this.location),
    };
  }

  // TODO: trigger state change on screen size change
  get deviceSizeState() {
    // TODO: use context to pass this down on server
    return Builder.isBrowser
      ? sizes.getSizeForWidth(window.innerWidth)
      : sizeMap[this.device] || 'large';
  }

  resizeListener = debounce(
    () => {
      const deviceSize = this.deviceSizeState;
      if (deviceSize !== this.state.state.deviceSize) {
        this.setState({
          ...this.state,
          state: {
            ...this.state.state,
            deviceSize,
          },
        });
      }
    },
    200,
    { leading: false, trailing: true }
  );

  // TODO: different options per device size...........................

  // static renderInto(
  //   elementOrSelector: string | HTMLElement,
  //   props: BuilderPageProps = {},
  //   hydrate = false
  // ) {
  //   const element =
  //     elementOrSelector instanceof HTMLElement
  //       ? elementOrSelector
  //       : document.querySelector(elementOrSelector)

  //   if (!element) {
  //     return
  //   }

  //   if (hydrate) {
  //     return ReactDOM.hydrate(<BuilderPage {...props} />, element)
  //   }
  //   return ReactDOM.render(<BuilderPage {...props} />, element)
  // }

  componentWillMount() {
    const key = this.props.apiKey;
    if (key && key !== builder.apiKey) {
      builder.apiKey = key;
    }

    if (this.props.content) {
      // TODO: this should be on didMount right bc of element ref??
      // TODO: possibly observe for change or throw error if changes
      this.onContentLoaded(this.props.content.data /*, this.props.content*/);
    }
  }

  componentDidMount() {
    if (Builder.isIframe) {
      parent.postMessage({ type: 'builder.sdkInjected', data: { modelName: this.name } }, '*');
    }

    if (Builder.isBrowser) {
      window.addEventListener('resize', this.resizeListener);

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('builder:component:load', {
            detail: {
              ref: this,
            },
          })
        );
      });
    }

    if (typeof this.state.state.componentDidMount === 'function') {
      try {
        this.state.state.componentDidMount();
      } catch (err) {
        console.error(err);
      }
    }
  }

  updateState = (fn: (state: any) => void) => {
    const nextState = produce(this.state.state, (draftState: any) => {
      fn(draftState);
      // TODO: emit dom event - what element? global?
    });
    this.setState({
      update: this.updateState,
      state: nextState,
    });

    this.notifyStateChange();
  };

  @debounceNextTick
  notifyStateChange() {
    const nextState = this.state.state;
    // TODO: only run the below once per tick...
    if (this.props.onStateChange) {
      this.props.onStateChange(nextState);
    }

    if (Builder.isBrowser) {
      window.dispatchEvent(
        new CustomEvent('builder:component:stateChange', {
          detail: {
            state: nextState,
            ref: this,
          },
        })
      );
    }
    this.onStateChange.next(nextState);
  }

  processStateFromApi(state: { [key: string]: any }) {
    return state; //  mapValues(state, value => tryEval(value, this.data, this._errors))
  }

  get location() {
    return this.props.location || (Builder.isBrowser ? location : ({} as any));
  }

  getCssFromFont(font: any) {
    if (!font) {
      return '';
    }
    // TODO: compute what font sizes are used and only load those.......
    const family = font.family + (font.kind && !font.kind.includes('#') ? ', ' + font.kind : '');
    const name = family.split(',')[0];
    const url = font.fileUrl ? font.fileUrl : font.files && font.files.regular;
    let str = '';
    if (url && family && name) {
      str += `
@font-face {
  font-family: ${family};
  src: local("${name}"), url('${url}') format('woff2');
  font-display: swap;
  font-weight: 400;
}
        `.trim();
    }

    if (font.files) {
      for (const weight in font.files) {
        // TODO: maybe limit number loaded
        const weightUrl = font.files[weight];
        if (weightUrl && weightUrl !== url) {
          str += `
@font-face {
  font-family: ${family};
  src: url('${weightUrl}') format('woff2');
  font-display: swap;
  font-weight: ${weight};
}
          `.trim();
        }
      }
    }
    return str;
  }

  componentWillUnmount() {
    this.unsubscribe();
    if (Builder.isBrowser) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  getFontCss(data: any) {
    // TODO: separate internal data from external
    return (
      data.customFonts &&
      data.customFonts.length &&
      data.customFonts.map((font: any) => this.getCssFromFont(font)).join(' ')
    );
  }

  getCss(data: any) {
    // .replace(/([^\s]|$)&([^\w])/g, '$1' + '.some-selector' + '$2')
    return (data.cssCode || '') + (this.getFontCss(data) || '');
  }

  get data() {
    return {
      ...this.props.data,
      ...this.state.state,
    };
  }

  componentDidUpdate(prevProps: BuilderPageProps) {
    // TODO: shallow diff
    if (this.props.data && prevProps.data !== this.props.data) {
      this.state.update((state: any) => {
        Object.assign(state, this.props.data);
      });
    }

    if (Builder.isEditing) {
      if (this.props.content && prevProps.content !== this.props.content) {
        this.onContentLoaded(this.props.content);
      }
    }
  }

  render() {
    const { content } = this.props;

    return (
      // TODO: data attributes for model, id, etc?
      <View data-name={this.name}>
        <BuilderAsyncRequestsContext.Consumer>
          {value => {
            this._asyncRequests = value && value.requests;
            this._errors = value && value.errors;
            this._logs = value && value.logs;

            return (
              <BuilderStoreContext.Provider
                value={{
                  ...this.state,
                  state: this.data,
                }}
              >
                {/* TODO: never use this? */}
                <BuilderContent
                  inline={this.props.inlineContent}
                  // TODO: pass entry in
                  contentLoaded={this.onContentLoaded}
                  options={{
                    entry: this.props.entry,
                    key: Builder.isEditing ? this.name : this.props.entry,
                    ...(content && size(content) && { initialContent: [content] }),
                    ...this.props.options,
                  }}
                  contentError={this.props.contentError}
                  modelName={this.name || 'page'}
                >
                  {(data, loading, fullData) => {
                    // TODO: loading option - maybe that is what the children is or component prop
                    return data ? (
                      <View
                        data-builder-component={this.name}
                        data-builder-content-id={fullData.id}
                        data-builder-variation-id={fullData.variationId}
                      >
                        <BuilderBlocks
                          emailMode={this.props.emailMode}
                          fieldName="blocks"
                          blocks={data.blocks}
                        />
                      </View>
                    ) : loading ? (
                      <View data-builder-component={this.name}>{this.props.children}</View>
                    ) : (
                      <View data-builder-component={this.name} />
                    );
                  }}
                </BuilderContent>
              </BuilderStoreContext.Provider>
            );
          }}
        </BuilderAsyncRequestsContext.Consumer>
      </View>
    );
  }

  evalExpression(expression: string) {
    const { data } = this;
    return expression.replace(/{{([^}]+)}}/g, (match, group) => tryEval(group, data, this._errors));
  }

  // TODO: customizable hm
  @Throttle(100, { leading: true, trailing: true })
  throttledHandleRequest(propertyName: string, url: string) {
    return this.handleRequest(propertyName, url);
  }

  async handleRequest(propertyName: string, url: string) {
    // TODO: Builder.isEditing = just checks if iframe and parent page is builder.io or localhost:1234
    if (Builder.isIframe && fetchCache[url]) {
      this.updateState(ctx => {
        ctx[propertyName] = fetchCache[url];
      });
      return fetchCache[url];
    }
    const request = async () => {
      const requestStart = Date.now();
      if (!Builder.isBrowser) {
        console.time('Fetch ' + url);
      }
      let json: any;
      try {
        const result = await fetch(url);
        json = await result.json();
      } catch (err) {
        if (this._errors) {
          this._errors.push(err);
        }
        if (this._logs) {
          this._logs.push(`Fetch to ${url} errored in ${Date.now() - requestStart}ms`);
        }
        return;
      } finally {
        if (!Builder.isBrowser) {
          console.timeEnd('Fetch ' + url);
          if (this._logs) {
            this._logs.push(`Fetched ${url} in ${Date.now() - requestStart}ms`);
          }
        }
      }

      if (json) {
        if (Builder.isIframe) {
          fetchCache[url] = json;
        }
        // TODO: debounce next tick all of these when there are a bunch
        this.updateState(ctx => {
          ctx[propertyName] = json;
        });
      }

      return json;
    };
    const existing =
      this._asyncRequests &&
      (this._asyncRequests.find(
        req => isRequestInfo(req) && req.url === url
      ) as RequestInfo | null);
    if (existing) {
      const promise = existing.promise;
      promise.then(json => {
        if (json) {
          this.updateState(ctx => {
            ctx[propertyName] = json;
          });
        }
      });
      return promise;
    }
    const promise = request();
    Builder.nextTick(() => {
      if (this._asyncRequests) {
        this._asyncRequests.push(promise);
      }
    });
    return promise;
  }

  unsubscribe() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();
    }
  }

  handleBuilderRequest(propertyName: string, optionsString: string) {
    const options = tryEval(optionsString, this.data, this._errors);
    // TODO: this will screw up for multiple bits of data
    if (this.subscriptions) {
      this.unsubscribe();
    }
    // TODO: don't unsubscribe and resubscribe every time data changes, will make a TON of requests if that's the case when editing...
    // I guess will be cached then
    if (options) {
      // TODO: unsubscribe on destroy
      this.subscriptions.add(
        builder.queueGetContent(options.model, options).subscribe(matches => {
          if (matches) {
            this.updateState(ctx => {
              ctx[propertyName] = matches;
            });
          }
        })
      );
    }
  }

  onContentLoaded = (data: any) => {
    // TODO: if model is page... hmm
    if (this.name === 'page' && Builder.isBrowser) {
      if (data) {
        const { title, description } = data;

        // if (title) {
        //   document.title = title;
        // }

        // if (description) {
        //   let descriptionTag = document.querySelector('meta[name="description"]');

        //   if (!descriptionTag) {
        //     descriptionTag = document.createElement('meta');
        //     descriptionTag.setAttribute('name', 'description');
        //     document.head.appendChild(descriptionTag);
        //   }

        //   descriptionTag!.setAttribute('content', description);
        // }
      }
    }

    // Unsubscribe all? TODO: maybe don't continuous fire when editing.....
    if (this.props.contentLoaded) {
      Builder.nextTick(() => {
        if (this.props.contentLoaded) {
          this.props.contentLoaded(data);
        }
      });
    }

    if (data && data.inputs && Array.isArray(data.inputs) && data.inputs.length) {
      if (!data.state) {
        data.state = {};
      }
      // TODO: may not want this... or make sure anything overriden
      // explitily sets to null
      data.inputs.forEach((input: any) => {
        if (input) {
          if (
            input.name &&
            input.defaultValue !== undefined &&
            data.state[input.name] === undefined
          ) {
            data.state[input.name] = input.defaultValue;
          }
        }
      });
    }

    if (data && data.state) {
      this.setState({
        ...this.state,
        state: {
          isBrowser: Builder.isBrowser,
          ...this.state.state,
          location: this.locationState,
          deviceSize: this.deviceSizeState,
          device: this.device,
          ...data.state,
          ...this.props.data,
        },
      });
    }

    // TODO: also throttle on edits maybe
    if (data && data.jsCode && Builder.isBrowser) {
      // Don't rerun js code when editing and not changed
      let skip = false;
      if (Builder.isEditing) {
        if (this.lastJsCode === data.jsCode) {
          skip = true;
        } else {
          this.lastJsCode = data.jsCode;
        }
      }

      if (!skip) {
        let state = this.state.state;
        const getState = () => this.state.state;
        const getUpdate = () => this.state.update;

        // TODO: move to helper and deep wrap like immer in case people make references
        // TODO: on set auto run in update if not already
        if (typeof Proxy !== 'undefined') {
          state = new Proxy(
            { ...state },
            {
              getOwnPropertyDescriptor(target, property) {
                try {
                  return Reflect.getOwnPropertyDescriptor(getState(), property);
                } catch (error) {
                  return undefined;
                }
              },
              // TODO: wrap other proxy properties
              // TODO: ensure batching updates
              set: function(target, key, value) {
                // TODO: do these for deep sets from references hmm
                // TODO: throttle these updates
                getUpdate()((state: any) => {
                  Reflect.set(state, key, value);
                });
                return true;
                // return Reflect.set(getState(), key, value)
                // return false;
              },
              // to prevent variable doesn't exist errors with `with (state)`
              has(target, property) {
                try {
                  // TODO: if dead trigger an immer update
                  return Reflect.has(getState(), property);
                } catch (error) {
                  return false;
                }
              },
              get(object, property) {
                if (
                  property &&
                  typeof property === 'string' &&
                  property.endsWith('Item') &&
                  !Reflect.has(getState(), property)
                ) {
                  // TODO: use $index to return a reference to the proxied version of item
                  // so can be set as well
                  return Reflect.get(state, property);
                }

                return Reflect.get(getState(), property);
              },
            }
          );
        }
        // TODO: real editing method
        try {
          const result = new Function(
            'data',
            'ref',
            'state',
            'update',
            'element',
            'Builder',
            'builder',
            data.jsCode
          )(data, this, state, this.state.update, this.ref, Builder, builder);

          // TODO: what if is promise...

          if (result && typeof result === 'object' && Object.keys(result).length) {
            this.state.update((state: any) => {
              Object.assign(result, state);
            });
          }

          if (result && typeof result.then === 'function') {
            result.then((val: any) => {
              if (val && typeof val === 'object' && Object.keys(val).length) {
                this.state.update((state: any) => {
                  Object.assign(val, state);
                });
              }
            });
          }

          // TODO: allow exports = { } syntax?
          // TODO: do something with reuslt like view - methods, computed, actions, properties, template, etc etc
        } catch (error) {
          if (Builder.isBrowser) {
            console.warn('Builder custom code error:', error.message, error.stack);
          } else {
            console.debug('Builder custom code error:', error.message, error.stack);
            // Add to req.options.errors to return to client
          }
        }
      }
    }

    if (data && data.httpRequests /* || data.builderData @DEPRECATED */ && !this.props.noAsync) {
      // Don't rerun http requests when editing and not changed
      let skip = false;
      if (Builder.isEditing) {
        const httpRequestsString = attempt(() => JSON.stringify(data.httpRequests));
        if (this.lastHttpRequests === httpRequestsString) {
          skip = true;
        } else if (!isError(httpRequestsString)) {
          this.lastHttpRequests = httpRequestsString;
        }
      }

      if (!skip) {
        // TODO: another structure for this
        for (const key in data.httpRequests) {
          const url: string | undefined = data.httpRequests[key];
          if (url && !this.data[key]) {
            // TODO: if Builder.isEditing and url patches https://builder.io/api/v2/content/{editingModel}
            // Then use builder.get().subscribe(...)
            if (Builder.isBrowser) {
              let lastUrl = this.evalExpression(url);
              const builderModelRe = /builder\.io\/api\/v2\/([^\/\?]+)/i;
              const builderModelMatch = url.match(builderModelRe);
              const model = builderModelMatch && builderModelMatch[1];
              if (Builder.isEditing && model && builder.editingModel === model) {
                this.subscriptions.add(
                  builder.get(model).subscribe(data => {
                    this.state.update((state: any) => {
                      state[key] = data;
                    });
                  })
                );
              } else {
                this.throttledHandleRequest(key, lastUrl);
                this.subscriptions.add(
                  this.onStateChange.subscribe(() => {
                    const newUrl = this.evalExpression(url);
                    if (newUrl !== lastUrl) {
                      this.throttledHandleRequest(key, newUrl);
                      lastUrl = newUrl;
                    }
                  })
                );
              }
            } else {
              this.handleRequest(key, this.evalExpression(url));
            }
          }
        }

        // @DEPRECATED
        // for (const key in data.builderData) {
        //   const url = data.builderData[key]
        //   if (url && !this.data[key]) {
        //     this.handleBuilderRequest(key, this.evalExpression(url))
        //   }
        // }
      }
    }
  };
}
