import { Builder, BuilderElement, Component } from '@builder.io/sdk';
import includes from 'lodash-es/includes';
import isArray from 'lodash-es/isArray';
import kebabCase from 'lodash-es/kebabCase';
import last from 'lodash-es/last';
import omit from 'lodash-es/omit';
import set from 'lodash-es/set';
import React from 'react';
import { View } from 'react-native';
import { Size } from '../constants/device-sizes.constant';
import { stringToFunction } from '../functions/string-to-function';
import { BuilderAsyncRequestsContext } from '../store/builder-async-requests';
import { BuilderStoreContext } from '../store/builder-store';

const Device = { desktop: 0, tablet: 1, mobile: 2 };

// TODO: pull from builer internal utils
const fastClone = (obj: object) => JSON.parse(JSON.stringify(obj));

// TODO: share these types in shared
type ElementType = any;

export interface BuilderBlockProps {
  fieldName?: string;
  block: BuilderElement;
  // TODO:
  // block: BuilderElement
  child?: boolean;
  index?: number;
  size?: Size;
  emailMode?: boolean;
  // TODO: use context
  ampMode?: boolean;
}

function capitalize(str: string) {
  if (!str) {
    return;
  }
  return str[0].toUpperCase() + str.slice(1);
}

interface BuilderBlocksState {
  state: any;
  update: Function;
}

export class BuilderBlock extends React.Component<BuilderBlockProps> {
  private _errors?: Error[];
  private _logs?: string[];

  private privateState: BuilderBlocksState = {
    state: {},
    update: () => {
      /* Intentionally empty */
    },
  };

  // TODO: handle adding return if none provided
  // TODO: cache/memoize this (globally with LRU?)
  stringToFunction(str: string, expression = true) {
    return stringToFunction(str, expression, this._errors, this._logs);
  }

  // <!-- Builder Blocks --> in comments hmm
  getElement(index = 0, state = this.privateState.state): React.ReactNode {
    const { block, child, fieldName } = this.props;
    let TagName = View; //  (block.tagName || 'div').toLowerCase();

    if (block.actions && block.actions.click) {
      // TODO: add back
      // TagName = TouchableWithoutFeedback as any;
    }

    let InnerComponent: any;
    const componentName =
      block.component && (block.component.name || (block.component as any).component);
    let componentInfo: Component | null = null;
    if (block.component && !(block.component as any).class) {
      if (block.component && block.component.tag) {
        InnerComponent = block.component.tag;
      } else {
        componentInfo = Builder.components.find(item => item.name === componentName) || null;
        if (componentInfo && componentInfo.class) {
          InnerComponent = componentInfo.class;
        } else if (componentInfo && componentInfo.tag) {
          InnerComponent = componentInfo.tag;
        }
      }
    }

    let options: any = {
      // Attributes?
      ...block.properties,
      style: {}, // this.styles
    };

    options = {
      ...options.properties,
      ...options,
    };

    if (block.component) {
      options.component = fastClone(block.component);
    }

    // Binding should be properties to href or href?
    // Manual style editor show bindings
    // Show if things bound in overlays hmm
    if (block.bindings) {
      for (const key in block.bindings) {
        const value = this.stringToFunction(block.bindings[key]);
        // TODO: pass block, etc
        set(options, key, value(state, null, block, {}, Device));
      }
    }

    if (options.hide) {
      return null;
    }

    let latestState = state;

    if (block.actions) {
      for (let key in block.actions) {
        const value = block.actions[key];
        if (key === 'click') {
          key = 'press';
        }
        options['on' + capitalize(key)] = (event: any) => {
          const update = (cb: Function) => {
            this.privateState.update((globalState: any) => {
              latestState = globalState;
              let localState = globalState;

              if (typeof Proxy !== 'undefined') {
                localState = new Proxy(
                  { ...globalState },
                  {
                    getOwnPropertyDescriptor(target, property) {
                      try {
                        return Reflect.getOwnPropertyDescriptor(latestState, property);
                      } catch (error) {
                        return undefined;
                      }
                    },
                    // TODO: wrap other proxy properties
                    set: function (target, key, value) {
                      // TODO: do these for deep sets from references hmm
                      return Reflect.set(latestState, key, value);
                      // return false;
                    },
                    // to prevent variable doesn't exist errors with `with (state)`
                    has(target, property) {
                      try {
                        // TODO: if dead trigger an immer update
                        return Reflect.has(latestState, property);
                      } catch (error) {
                        return false;
                      }
                    },
                    get(object, property) {
                      if (
                        property &&
                        typeof property === 'string' &&
                        property.endsWith('Item') &&
                        !Reflect.has(latestState, property)
                      ) {
                        // TODO: use $index to return a reference to the proxied version of item
                        // so can be set as well
                        return Reflect.get(state, property);
                      }

                      return Reflect.get(latestState, property);
                    },
                  }
                );
              }
              return cb(localState, event, undefined, {}, Device, update);
            });
          };
          const fn = this.stringToFunction(value, false);
          update(fn);
        };
      }
    }

    const innerComponentProperties = (options.component || options.options) && {
      ...options.options,
      ...(options.component.options || options.component.data),
    };

    const isVoid = false;

    const noWrap = componentInfo && (componentInfo.fragment || componentInfo.noWrap);

    const finalOptions: { [key: string]: any } = {
      ...omit(options, 'class', 'component'),
      style: this.styles,
      class:
        `builder-block ${this.id}${block.class ? ` ${block.class}` : ''}${
          block.component && !includes(['Image', 'Video', 'Banner'], componentName)
            ? ` builder-has-component`
            : ''
        }` + (options.class ? ' ' + options.class : ''),
      key: this.id + index,
      // Remove for amp mode
      'builder-id': this.id,
      // ref: ((ref: any) => (this.ref = ref)) as any,
      ...(index !== 0 && {
        'builder-index': index,
      }),
    };

    const children = block.children || finalOptions.children || [];

    // TODO: test it out
    return (
      <BuilderAsyncRequestsContext.Consumer>
        {value => {
          this._errors = value && value.errors;
          this._logs = value && value.logs;
          return isVoid ? (
            <React.Fragment>
              {/* {styleTag} */}
              <TagName {...finalOptions} />
            </React.Fragment>
          ) : InnerComponent && (noWrap || this.props.emailMode) ? (
            // TODO: pass the class to be easier
            // TODO: acceptsChildren option?
            <React.Fragment>
              <InnerComponent
                // Final options maaay be wrong here hm
                {...innerComponentProperties}
                attributes={finalOptions}
                builderBlock={block}
              />
            </React.Fragment>
          ) : (
            <TagName {...(finalOptions as any)}>
              {/* {styleTag} */}
              {InnerComponent && (
                <InnerComponent builderBlock={block} {...innerComponentProperties} />
              )}
              {!InnerComponent && children && children.length
                ? children.map((block: ElementType, index: number) => (
                    <BuilderBlock
                      key={((this.id as string) || '') + index}
                      block={block}
                      index={index}
                      size={this.props.size}
                      fieldName={this.props.fieldName}
                      child={this.props.child}
                      emailMode={this.props.emailMode}
                    />
                  ))
                : null}
            </TagName>
          );
        }}
      </BuilderAsyncRequestsContext.Consumer>
    );
  }

  get id() {
    const { block } = this.props;
    if (!block.id!.startsWith('builder')) {
      return 'builder-' + block.id;
    }
    return block.id!;
  }

  contents(state: BuilderBlocksState) {
    const { block } = this.props;

    // this.setState(state);
    this.privateState = state;

    if (block.repeat && block.repeat.collection) {
      const collectionPath = block.repeat.collection;
      const collectionName = last((collectionPath || '').trim().split('(')[0].trim().split('.'));
      const itemName = block.repeat.itemName || (collectionName ? collectionName + 'Item' : 'item');
      const array = this.stringToFunction(collectionPath)(state.state, null, block, {}, Device);
      if (isArray(array)) {
        return array.map((data, index) => {
          // TODO: Builder state produce the data
          const childState = {
            ...state.state,
            $index: index,
            $item: data,
            [itemName]: data,
          };

          return (
            <BuilderStoreContext.Provider
              key={index}
              value={{ ...state, state: childState } as any}
            >
              {this.getElement(index, childState)}
            </BuilderStoreContext.Provider>
          );
        });
      }
      return null;
    }

    return this.getElement();
  }

  render() {
    return (
      <BuilderStoreContext.Consumer>{value => this.contents(value)}</BuilderStoreContext.Consumer>
    );
  }
}
