import { useEffect } from 'react';
import { setupBrowserForEditing } from '../../scripts/init-editing.js';
import type { RegisteredComponent } from '../../context/types.js';

export type BuilderEditingProps = {
  model: string;
  components?: RegisteredComponent[];
  children: any;
  onEditingUpdate?: (url: URL) => void;
};

export default function BuilderEditing(props: BuilderEditingProps) {
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
          fetch('/api/builderData', {
            body: JSON.stringify(e.data.data),
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(() => {
            const current = new URL(window.location.href);
            current.searchParams.set('v', String(Date.now()));
            props.onEditingUpdate?.(current);
          });
        }
      }
    }

    addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [props.model]);
  return (
    <div
      onClickCapture={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {props.children}
    </div>
  );
}
