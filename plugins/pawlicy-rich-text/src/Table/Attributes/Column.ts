import { Quill } from 'react-quill'

const Parchment = Quill.import('parchment')

const Column = new Parchment.Attributor.Attribute('column', 'column')

export { Column }
