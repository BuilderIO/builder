import React from 'react'
import { BuilderElement } from '@builder.io/sdk'
import { BuilderBlock } from '../components/builder-block.component'

export const withChildren = <P extends object>(
  Component: React.ComponentType<P>
) => (
  props: React.PropsWithChildren<P> & { builderBlock?: BuilderElement }
) => {
  const children =
    props.children ||
    (props.builderBlock &&
      props.builderBlock.children &&
      props.builderBlock.children.map(child => (
        <BuilderBlock key={child.id} block={child} />
      )))

  return <Component {...props}>{children}</Component>
}
