import { wrapComponentRef } from '../../../content/wrap-component-ref.js';

import Block from '../../block';

import BlockStyles from '../block-styles';

import InteractiveElement from '../interactive-element';

import { ComponentProps, getWrapperProps } from './component-ref.helpers.js';

import { Fragment, component$, h, useStore } from '@builder.io/qwik';

export const ComponentRef = component$((props: ComponentProps) => {
  const state = useStore<any>({
    Wrapper: props.isInteractive ? InteractiveElement : props.componentRef,
  });

  return (
    <>
      {props.componentRef ? (
        <state.Wrapper
          {...getWrapperProps({
            componentOptions: props.componentOptions,
            builderBlock: props.builderBlock,
            context: props.context,
            componentRef: props.componentRef,
            includeBlockProps: props.includeBlockProps,
            isInteractive: props.isInteractive,
            contextValue: props.context,
          })}
        >
          {(props.blockChildren || []).map((child) => {
            return (
              <Block
                key={'block-' + child.id}
                block={child}
                context={props.context}
                registeredComponents={props.registeredComponents}
              ></Block>
            );
          })}
          {(props.blockChildren || []).map((child) => {
            return (
              <BlockStyles
                key={'block-style-' + child.id}
                block={child}
                context={props.context}
              ></BlockStyles>
            );
          })}
        </state.Wrapper>
      ) : null}
    </>
  );
});

export default ComponentRef;
