import { Quill } from 'react-quill'

const Parchment = Quill.import('parchment')

const ListStyle = new Parchment.Attributor.Class('liststyle', 'list-style')

export { ListStyle }
