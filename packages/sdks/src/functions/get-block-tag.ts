import { JSX } from '@builder.io/mitosis/jsx-runtime';
import { BuilderBlock } from '../types/builder-block.js';

type JSXElementConstructor<P> = (props: P) => JSX.Element | null;

export type TagName = string | JSXElementConstructor<any>;
/**
 * The `JSXElementConstructor` type is here to account for a react-native override, where we have a
 * `View` tag wrapping every component.
 */
export function getBlockTag(block: BuilderBlock): TagName {
  return block.tagName || 'div';
}
