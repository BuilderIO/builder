export {
  default as Button,
  ButtonProps,
} from '../blocks/button/button.lite.jsx';
export {
  ColumnProps,
  default as Columns,
} from '../blocks/columns/columns.lite.jsx';
export {
  default as Fragment,
  FragmentProps,
} from '../blocks/fragment/fragment.lite.jsx';
export { default as Image, ImageProps } from '../blocks/image/image.lite.jsx';
export {
  default as Section,
  SectionProps,
} from '../blocks/section/section.lite.jsx';
export {
  default as Symbol,
  SymbolProps,
} from '../blocks/symbol/symbol.lite.jsx';
export { default as Text, TextProps } from '../blocks/text/text.lite.jsx';
export { default as Video, VideoProps } from '../blocks/video/video.lite.jsx';

import {
  default as Blocks,
  BlocksProps,
} from '../components/blocks/blocks.lite.jsx';
import { default as Content } from '../components/content-variants/content-variants.lite.jsx';

export { Blocks, BlocksProps, Content };

/**
 * @deprecated Renamed to `Blocks`.
 */
export const RenderBlocks = Blocks;
/**
 * @deprecated Renamed to `Content`.
 */
export const RenderContent = Content;
