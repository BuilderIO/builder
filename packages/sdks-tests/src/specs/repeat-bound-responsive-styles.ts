/**
 * A repeated Text block whose `responsiveStyles.large.color` is bound to the
 * repeat item. Every item shares the block id (and so the CSS class), but each
 * produces a different CSS text. The emitted styles are therefore
 * red, blue, red for the same selector, and the last one wins for all items.
 */
export const REPEAT_BOUND_RESPONSIVE_STYLES = {
  data: {
    title: 'repeat-bound-responsive-styles',
    inputs: [],
    state: {
      items: [{ color: 'red' }, { color: 'blue' }, { color: 'red' }],
    },
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-repeat-bound-style-item',
        repeat: { collection: 'state.items' },
        bindings: {
          'responsiveStyles.large.color':
            'var _virtual_index=state.$item.color;return _virtual_index',
        },
        code: {
          bindings: {
            'responsiveStyles.large.color': 'state.$item.color',
          },
        },
        component: {
          name: 'Text',
          options: { text: 'repeat bound style item' },
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
          },
        },
      },
    ],
  },
  id: 'repeat-bound-responsive-styles',
  name: 'repeat-bound-responsive-styles',
  published: 'published',
  modelId: 'page',
};
