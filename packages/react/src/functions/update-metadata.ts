import { Component, Builder } from '@builder.io/sdk';

/**
 * Update metadata for a Builder component
 *
 * @param component Builder react component
 * @param fn Updater
 *
 * @example
 *    updatMetadata(TextBlock, current => ({
 *       ...current,
 *       fields: [
 *        ...curent.fields,
 *        { name: 'myNewField', type: 'string' }
 *       ]
 *    }))
 */
export function updateMetadata(
  component: Function | string,
  fn: (currentMetadata: Component | null) => Component | void
) {
  const match =
    Builder.components.find(item => {
      if (typeof component === 'string') {
        return item.name === component;
      } else {
        return item.class === item;
      }
    }) || null;

  const updated = fn(match);
  if (match && updated) {
    // re-registering the same component will replace it
    Builder.registerComponent(updated.class || match.class, updated);
  } else if (match && !updated) {
    // TODO: have a way to message to remove component
  } else if (!match && updated) {
    Builder.registerComponent(updated.class, updated);
  }
}
