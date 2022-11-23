import React, { useEffect } from 'react';
import { setupBrowserForEditing } from '../../scripts/init-editing.js';
import type { RegisteredComponent } from '../../context/types.js';
import type { BuilderContent } from '../../types/builder-content.js';

export type OnUpdateCallback = (data: {
  data: BuilderContent,
  key: string,
}) => void;

export type BuilderEditingProps = {
  model: string,
  components?: RegisteredComponent[],
  children: any,
  onUpdate?: OnUpdateCallback,
};

export function BuilderEditingWrapper(props: BuilderEditingProps) {
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

    function onMessage(e: MessageEvent) {
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
