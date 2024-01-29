import { Quill } from 'react-quill'

const Script = Quill.import('formats/script')

class ScriptStyleType extends Script {
  constructor(attrName: string, keyName: string, options: {}) {
    super(attrName, keyName, options)
  }
  static create(value: string) {
    if (value === 'super') {
      const el = document.createElement('sup')
      return (el.style.verticalAlign = 'super'), (el.style.fontSize = 'smaller'), el
    }
    if (value === 'sub') {
      const el = document.createElement('sub')
      return (el.style.verticalAlign = 'sub'), (el.style.fontSize = 'smaller'), el
    }
    return super.create(value)
  }
}

export { ScriptStyleType }
