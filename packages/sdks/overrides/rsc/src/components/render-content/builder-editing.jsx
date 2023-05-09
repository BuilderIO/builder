import React, { useEffect } from 'react';
import { setupBrowserForEditing } from '../../scripts/init-editing.js';
// import type { RegisteredComponent } from '../../context/types.js';
// import type { BuilderContent } from '../../types/builder-content.js';

/**
 * @typedef {object} RegisteredComponent
 * @typedef {object} BuilderContent
 * @typedef {(data: {data: object, key: string }) => void} OnUpdateCallback
 * @typedef {{
 *   model: string,
 *   components?: RegisteredComponent[],
 *   children: any,
 *   onUpdate?: OnUpdateCallback,
 * }} BuilderEditingProps
 */

/**
 * @param {BuilderEditingProps} props
 */
export function BuilderEditingWrapper(props) {
  useEffect(() => {
    setupBrowserForEditing();

    if (props.components) {
      for (const component of props.components) {
        window.parent.postMessage(
          {
            type: 'builder.registerComponent',
            data: component,
          },
          '*'
        );
      }
    }

    /**
     *
     * @param {MessageEvent} e
     */
    function onMessage(e) {
      switch (e.data?.type) {
        case 'builder.contentUpdate': {
          props.onUpdate?.(e.data.data);
        }
      }
    }

    addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [props.model]);
  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      onClickCapture={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {props.children}
    </div>
  );
}
