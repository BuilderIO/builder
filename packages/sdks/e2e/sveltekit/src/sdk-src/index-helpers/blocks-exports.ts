export { default as Button } from '../blocks/button/button.svelte';
export { default as Columns } from '../blocks/columns/columns.svelte';
export { default as Fragment } from '../blocks/fragment/fragment.svelte';
export { default as Image } from '../blocks/image/image.svelte';
export { default as Section } from '../blocks/section/section.svelte';
export { default as Symbol } from '../blocks/symbol/symbol.svelte';
export { default as Text } from '../blocks/text/text.svelte';
export { default as Video } from '../blocks/video/video.svelte';
import { default as Blocks } from '../components/blocks/blocks.svelte';
import { default as Content } from '../components/content-variants/content-variants.svelte';
export { Blocks, Content };

/**
 * @deprecated Use `Blocks` instead.
 */
export const RenderBlocks = Blocks;
/**
 * @deprecated Use `Content` instead.
 */
export const RenderContent = Content