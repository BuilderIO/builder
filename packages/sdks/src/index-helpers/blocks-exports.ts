export { default as Button } from '../blocks/button/button.lite';
export { default as Columns } from '../blocks/columns/columns.lite';
export { default as Fragment } from '../blocks/fragment/fragment.lite';
export { default as Image } from '../blocks/image/image.lite';
export { default as Section } from '../blocks/section/section.lite';
export { default as Symbol } from '../blocks/symbol/symbol.lite';
export { default as Text } from '../blocks/text/text.lite';
export { default as Video } from '../blocks/video/video.lite';

import { default as Blocks } from '../components/blocks/blocks.lite';
import { default as Content } from '../components/content-variants/content-variants.lite';

export { Blocks, Content };

/**
 * @deprecated Use `Blocks` instead.
 */
export const RenderBlocks = Blocks;
/**
 * @deprecated Use `Content` instead.
 */
export const RenderContent = Content;
