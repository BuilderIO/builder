/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Builder, BuilderElement } from '@builder.io/sdk';
import { BuilderBlocks } from 'src/components/builder-blocks.component';

Builder.registerComponent(Mutation, {
  name: 'Builder:Mutation',
  canHaveChildren: true,
  noWrap: true,
  inputs: [
    {
      name: 'selector',
      // TODO: special UI for this
      type: 'uiSelector',
    },
  ],
});

type MutationProps = {
  selector: string;
  builderBlock?: BuilderElement;
};

export function Mutation(props: MutationProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  useWaitForSelector(props.selector, node => {
    // TODO: static generate this logic
    node.innerHTML = '';
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
        dataPath="children"
        blocks={children}
      />
    </span>
  );
}

function useWaitForSelector(selector: string, cb: (node: Element) => void) {
  React.useLayoutEffect(() => {
    const existingElement = document.querySelector(selector);
    if (existingElement) {
      cb(existingElement);
      return;
    }
    const observer = new MutationObserver(() => {
      const foundElement = document.querySelector(selector);
      if (foundElement) {
        observer.disconnect();
        cb(foundElement);
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
