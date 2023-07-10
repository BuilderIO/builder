'use client'
import { PropsWithChildren } from 'react'
import FContext from './FContext'

type Props = PropsWithChildren<{
  context: number
}>

export default function ClientContextProvider(props: Props) {
  return (
    <FContext.Provider value={props.context}>
      {props.children}
    </FContext.Provider>
  )
}
