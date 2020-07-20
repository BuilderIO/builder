import React from 'react';
import { BuilderElement } from '@builder.io/sdk';
import { BuilderBlock } from '../components/builder-block.component';

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
      const children =
        props.children ||
        (props.builderBlock &&
          props.builderBlock.children &&
          props.builderBlock.children.map(child => <BuilderBlock key={child.id} block={child} />));

      return (
        <Component {...props} ref={ref}>
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
