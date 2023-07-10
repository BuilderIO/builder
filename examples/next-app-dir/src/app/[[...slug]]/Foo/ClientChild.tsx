'use client'
import { useContext } from 'react'
import FContext from './FContext'

export default function ClientChild() {
  const context = useContext(FContext)
  return <>{context}</>
}
