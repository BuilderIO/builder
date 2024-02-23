'use client';
import React from 'react';
import { BuilderElement } from '@builder.io/sdk';
import { BuilderBlock } from '../components/builder-block.component';

const isBuilderElement = (item: unknown): item is BuilderElement => {
  return Boolean(
    typeof item === 'object' && item && (item as any)?.['@type'] === '@builder.io/sdk:Element'
  );
};

/**
 * Higher order component for passing Builder.io children as React children
 *
 * @example
 * ```tsx
 *
 *    const MyButton = props => <Button>
 *      {children}
 *    </Button>
 *
 *    const ButtonWithBuilderChildren = withChildren(MyButton)
 *
 *    Builder.registerComponent(ButtonWithBuilderChildren, {
 *      name: 'MyButton',
 *      defaultChildren: [
 *        {
 *          '@type': '@builder.io/sdk:Element'
 *        }
 *      ]
 *    })
 * ```
 */
export const withChildren = <P extends object>(Component: React.ComponentType<P>) => {
  const HOC = React.forwardRef<any, React.PropsWithChildren<P> & { builderBlock?: BuilderElement }>(
    (props, ref) => {
      const useProps = { ...props };
      const children =
        props.children ||
        (props.builderBlock &&
          props.builderBlock.children &&
          props.builderBlock.children.map(child => <BuilderBlock key={child.id} block={child} />));

      const componentOptions = props.builderBlock?.component?.options;
      if (!!componentOptions) {
        Object.keys(componentOptions).forEach(key => {
          const value = componentOptions[key];
          if (Array.isArray(value) && value.every(isBuilderElement)) {
            useProps[key] = value.map(child => <BuilderBlock key={child.id} block={child} />);
          } else if (isBuilderElement(value)) {
            useProps[key] = <BuilderBlock block={value} />;
          }
        });
      }

      return (
        // getting type errors due to `@types/react` version mismatches. Can safely ignore.
        // @ts-ignore
        <Component {...useProps} ref={ref}>
          {children}
        </Component>
      );
    }
  );

  (HOC as any).builderOptions = {
    canHaveChildren: true,
  };

  return HOC;
};
