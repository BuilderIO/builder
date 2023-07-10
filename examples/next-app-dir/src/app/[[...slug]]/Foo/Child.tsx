import { useContext } from 'react'
import FContext from './FContext'
import ClientChild from './ClientChild'

export default function Child() {
  const context = useContext(FContext)
  return (
    <div>
      {context}
      <ClientChild />
    </div>
  )
}
