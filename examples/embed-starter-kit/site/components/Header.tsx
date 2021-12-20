import { BuilderComponent } from '@builder.io/react'

/**
 * Global header editable in Builder
 */
export function Header(props: { header: any }) {
  return <BuilderComponent model="header" content={props.header} />
}
