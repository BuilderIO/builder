import { Quill } from 'react-quill'

const Parchment = Quill.import('parchment')

const Id = new Parchment.Attributor.Attribute('id', 'id', {
  scope: Parchment.Scope.INLINE,
})

export { Id }
