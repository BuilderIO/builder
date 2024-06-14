import { Quill } from 'react-quill'

const Link = Quill.import('formats/link')

class LinkType extends Link {
  static create(val: string) {
    let value = val
    const node = super.create(value)
    return (
      (value = this.sanitize(value)),
      value.startsWith('https://') ||
        value.startsWith('http://') ||
        value.startsWith('//') ||
        node.removeAttribute('target'),
      node
    )
  }
}

export { LinkType }
