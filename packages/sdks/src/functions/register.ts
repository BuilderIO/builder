import { BuilderBlock } from '../types/builder-block';
import { DeepPartial } from '../types/deep-partial';
import { isBrowser } from './is-browser';

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
