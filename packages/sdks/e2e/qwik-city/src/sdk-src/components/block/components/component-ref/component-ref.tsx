import { wrapComponentRef } from '../../../content/wrap-component-ref';

import Block from '../../block';

import BlockStyles from '../block-styles';

import InteractiveElement from '../interactive-element';

import { ComponentProps, getWrapperProps } from './component-ref.helpers';

import { Fragment, component$, h, useStore } from '@builder.io/qwik';

export const ComponentRef = component$((props: ComponentProps) => {
  const state = useStore({
    Wrapper: props.isInteractive ? InteractiveElement : props.componentRef,
  });

  return (
    <>
      {props.componentRef ? (
        <>
          <div>
            ComponentRef:{' '}
            {/* {JSON.stringify(
              getWrapperProps({
                componentOptions: props.componentOptions,
                builderBlock: props.builderBlock,
                context: props.context,
                componentRef: props.componentRef,
                includeBlockProps: props.includeBlockProps,
                isInteractive: props.isInteractive,
                contextValue: props.context,
              })
            )} */}
          </div>
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
            {(props.blockChildren || []).map(function (child) {
              return (
                <Block
                  key={'block-' + child.id}
                  block={child}
                  context={props.context}
                  registeredComponents={props.registeredComponents}
                ></Block>
              );
            })}
            {(props.blockChildren || []).map(function (child) {
              return (
                <BlockStyles
                  key={'block-style-' + child.id}
                  block={child}
                  context={props.context}
                ></BlockStyles>
              );
            })}
          </state.Wrapper>
        </>
      ) : null}
    </>
  );
});

export default ComponentRef;
