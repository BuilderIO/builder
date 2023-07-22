import { Quill } from 'react-quill'

const Parchment = Quill.import('parchment')

const Colspan = new Parchment.Attributor.Attribute('colspan', 'colspan')

export { Colspan }
