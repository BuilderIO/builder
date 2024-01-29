import { Quill } from 'react-quill'

import { ListStyle } from './ListStyle'

const List = Quill.import('formats/list')
const ListItem = Quill.import('formats/list/item')

class StyledListItem extends ListItem {
  format(name: string, value: string) {
    if (name === 'liststyle') {
      ListStyle.add(this.parent.domNode, value)
    } else {
      super.format(name, value)
    }
  }
}

class StyledList extends List {
  format(name: string, value: string) {
    if (name === 'liststyle') {
      ListStyle.add(this.domNode, value)
    } else {
      super.format(name, value)
    }
  }
}

export { StyledList, StyledListItem }
