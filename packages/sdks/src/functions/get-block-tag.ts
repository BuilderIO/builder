import { BuilderBlock } from '../types/builder-block.js';
import type { JSXElementConstructor } from 'react';

/**
 * The `JSXElementConstructor` type is here to account for a react-native override, where we have a
 * `View` tag wrapping every component.
 */
export function getBlockTag(
  block: BuilderBlock
): string | JSXElementConstructor<any> {
  return block.tagName || 'div';
}
