import type { BuilderBlock } from '../types/builder-block.js';
import type { DeepPartial } from '../types/deep-partial.js';
import { isBrowser } from './is-browser.js';
import { serializeIncludingFunctions } from './register-component.js';
import type { Input } from '../types/input.js';

export interface Action {
  name: string;
  inputs?: readonly Input[];
  returnType?: Input;
  action: (options: Record<string, any>) => string;
  /**
   * Is an action for expression (e.g. calculating a binding like a formula
   * to fill a value based on locale) or a function (e.g. something to trigger
   * on an event like add to cart) or either (e.g. a custom code block)
   */
  kind: 'expression' | 'function' | 'any';
  /**
   * Globally unique ID for an action, e.g. "@builder.io:setState"
   */
  id: string;
}

export interface InsertMenuItem {
  name: string;
  icon?: string;
  item: DeepPartial<BuilderBlock>;
}

export interface InsertMenuConfig {
  name: string;
  priority?: number;
  persist?: boolean;
  advanced?: boolean;
  items: InsertMenuItem[];
}

const registry: { [key: string]: any[] } = {};

export function register(type: 'insertMenu', info: InsertMenuConfig): void;
export function register(type: string, info: any): void;
export function register(type: string, info: any) {
  if (type === 'plugin') {
    info = serializeIncludingFunctions(info);
  }
  let typeList = registry[type];
  if (!typeList) {
    typeList = registry[type] = [];
  }
  typeList.push(info);
  if (isBrowser()) {
    const message = {
      type: 'builder.register',
      data: {
        type,
        info,
      },
    };
    try {
      parent.postMessage(message, '*');
      if (parent !== window) {
        window.postMessage(message, '*');
      }
    } catch (err) {
      console.debug('Could not postmessage', err);
    }
  }
}

export function registerAction(action: Action) {
  if (isBrowser()) {
    const actionClone = JSON.parse(JSON.stringify(action));
    if (action.action) {
      actionClone.action = action.action.toString();
    }
    window.parent?.postMessage(
      {
        type: 'builder.registerAction',
        data: actionClone,
      },
      '*'
    );
  }
}
