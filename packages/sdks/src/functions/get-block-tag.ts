import { BuilderBlock } from '../types/builder-block.js';
import type { JSXElementConstructor } from 'react';

export type TagName = string | JSXElementConstructor<any>;
/**
 * The `JSXElementConstructor` type is here to account for a react-native override, where we have a
 * `View` tag wrapping every component.
 */
export function getBlockTag(block: BuilderBlock): TagName {
  return block.tagName || 'div';
}
