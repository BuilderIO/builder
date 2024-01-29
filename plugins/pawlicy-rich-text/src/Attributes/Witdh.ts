import { Quill } from 'react-quill'

const Parchment = Quill.import('parchment')

const Width = new Parchment.Attributor.Attribute('width', 'width', {
  scope: Parchment.Scope.INLINE,
})

export { Width }
