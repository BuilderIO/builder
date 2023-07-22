import { Quill } from 'react-quill'

const Parchment = Quill.import('parchment')

class IndentAttributor extends Parchment.Attributor.Style {
  constructor(attrName: string, keyName: string, options: {}) {
    super(attrName, keyName, options)
  }
  add(node: HTMLElement, value: string) {
    const useValue = parseInt(value)
    return !value || useValue === 0 ? (this.remove(node), !0) : super.add(node, `${value}em`)
  }
}

const IndentStyle = new IndentAttributor('indent', 'text-indent', {
  scope: Parchment.Scope.BLOCK,
  whitelist: ['1em', '2em', '3em', '4em', '5em', '6em', '7em', '8em', '9em'],
})

export { IndentStyle }
