/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Builder, BuilderElement } from '@builder.io/sdk';
import { BuilderBlocks } from '../components/builder-blocks.component';

Builder.registerComponent(Mutation, {
  name: 'Builder:Mutation',
  canHaveChildren: true,
  noWrap: true,
  hideFromInsertMenu: true,
  inputs: [
    {
      name: 'type',
      type: 'string',
      defaultValue: 'replace',
      enum: [
        {
          label: 'Replace',
          value: 'replace',
          helperText: 'Replace the contents of this site region with content from Builder',
        },
        {
          label: 'Append',
          value: 'afterEnd',
          helperText: 'Append Builder content after the chosen site region',
        },
      ],
    },
    {
      name: 'selector',
      // TODO: special UI for this
      type: 'builder:domSelector',
    },
  ],
});

type MutationProps = {
  selector: string;
  builderBlock?: BuilderElement;
  type?: 'replace' | 'afterEnd';
};

export function Mutation(props: MutationProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  useWaitForSelector(props.selector, node => {
    // TODO: static generate this logic
    if (props.type !== 'afterEnd') {
      node.innerHTML = '';
    }
    node.appendChild(ref.current!.firstElementChild!);
  });

  const children = props.builderBlock?.children;

  return (
    <span style={{ display: 'none' }} ref={ref}>
      <BuilderBlocks
        style={{
          display: 'inline',
        }}
        child
        parentElementId={props.builderBlock?.id}
        dataPath="this.children"
        blocks={children}
      />
    </span>
  );
}

function useWaitForSelector(selector: string, cb: (node: Element) => void) {
  React.useLayoutEffect(() => {
    try {
      const existingElement = document.querySelector(selector);
      if (existingElement) {
        cb(existingElement);
        return;
      }
    } catch (err) {
      console.warn(err);
    }

    const observer = new MutationObserver(() => {
      try {
        const foundElement = document.querySelector(selector);
        if (foundElement) {
          observer.disconnect();
          cb(foundElement);
        }
      } catch (err) {
        console.warn(err);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [selector]);
}
