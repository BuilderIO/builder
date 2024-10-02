import { Quill } from 'react-quill';
const Block = Quill.import('blots/block');

export type AllowedTags = 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'P' | 'SPAN';

class Typography extends Block {
  static blotName = 'typography';
  static tagName = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN'];

  static create(value: string) {
    const data = JSON.parse(value);
    const node = super.create(data.tag) as HTMLElement;
  
    if (data.className) {
      node.className = data.className;
    }

    return node;
  }

  static formats(node: Element) {
    return JSON.stringify({
      tag: node.tagName as AllowedTags,
      className: node.className,
    });
  }
}

export default Typography;
