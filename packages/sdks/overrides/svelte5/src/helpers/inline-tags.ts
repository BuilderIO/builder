/**
 * `<style>` / `<script>` tags as HTML strings for `{@html}`: Svelte components cannot put a
 * `<script>` in their markup, and a raw string keeps hydration from walking into the tag.
 */
const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const attr = (name: string, value: string | undefined) =>
  value ? ` ${name}="${escapeAttr(value)}"` : '';

export const styleTag = (id: string, css: string, nonce?: string) =>
  css
    ? `<style data-id="${id}"${attr('nonce', nonce)}>${css.replace(
        /<\/style/gi,
        '<\\/style'
      )}</style>`
    : '';

export const scriptTag = (id: string, js: string, nonce?: string) =>
  `<script data-id="${id}"${attr('nonce', nonce)}>${js.replace(
    /<\/script/gi,
    '<\\/script'
  )}</script>`;

/** Keys a list by block id, de-duplicating repeated ids (a keyed each must have unique keys). */
export function keyBlocks<T extends { id?: string }>(
  blocks: T[] | undefined
): { block: T; key: string }[] {
  if (!blocks) return [];
  const seen = new Map<string, number>();
  return blocks.map((block, index) => {
    const id = block.id ?? `#${index}`;
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    return { block, key: count ? `${id}#${count}` : id };
  });
}
