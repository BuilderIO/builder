import { Quill } from 'react-quill'

const Parchment = Quill.import('parchment')

const Id = new Parchment.Attributor.Attribute('id', 'id')

export { Id }
