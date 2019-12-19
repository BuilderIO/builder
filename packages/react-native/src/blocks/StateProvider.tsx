import React from 'react'
import { BuilderElement } from '@builder.io/sdk'
import { BuilderBlock as BuilderBlockComponent } from '../components/builder-block.component'
import { BuilderBlock } from '../decorators/builder-block.decorator'
import { BuilderStoreContext } from '../store/builder-store'

interface StateProviderProps {
  builderBlock: BuilderElement
  state: any
}

// TODO: change to slick grid
@BuilderBlock({
  // Builder:StateProvider?
  name: 'Builder:StateProvider',
  // TODO: default children
  canHaveChildren: true,
  hideFromInsertMenu: true
  // TODO: list inputs?
})
export class StateProvider extends React.Component<StateProviderProps> {
  render() {
    return (
      <BuilderStoreContext.Consumer>
        {state => (
          <BuilderStoreContext.Provider
            value={{
              ...state,
              state: {
                ...state.state,
                ...this.props.state
              }
            }}
          >
            {/* Builer blocks or iterate blocks?? */}
            {this.props.builderBlock &&
              this.props.builderBlock.children &&
              this.props.builderBlock.children.map((block, index) => (
                <BuilderBlockComponent
                  block={block}
                  index={index}
                  key={block.id}
                />
              ))}
          </BuilderStoreContext.Provider>
        )}
      </BuilderStoreContext.Consumer>
    )
  }
}
