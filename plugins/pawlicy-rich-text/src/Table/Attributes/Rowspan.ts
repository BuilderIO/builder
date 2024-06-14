import { Quill } from 'react-quill'

const Parchment = Quill.import('parchment')

const Rowspan = new Parchment.Attributor.Attribute('rowspan', 'rowspan')

export { Rowspan }
