import React from 'react'
import FContext from './FContext'

export default function ContextUpdater(props: any) {
  const context = React.useContext(FContext)

  if (props.searchParams['foo']) {
    console.log('patching', context.patches)
    context.addPatch(props.searchParams['foo'])
  }
  return (
    <>
      patches: {JSON.stringify(context.patches)}
      {props.children}
    </>
  )
}
