/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import { Builder } from '@builder.io/sdk';
import { BuilderStoreContext } from '../store/builder-store';

export interface SpacerProps {
  id: string;
  position: 'before' | 'after';
}

interface SpacerState {
  grow: boolean;
}

class Growser extends React.Component<{ className?: string }> {
  state = {
    grow: false,
    show: false,
  };

  componentDidMount() {
    // setTimeout needed?
    setTimeout(() => {
      this.setState({
        grow: true,
      });
    });
  }

  render() {
    return (
      <div
        className={
          (this.props.className || '') + ' ' + (this.state.grow ? 'builder__spacer__grow' : '')
        }
        css={{
          height: this.state.grow ? 30 : 0,
          opacity: this.state.grow ? 1 : 0,
        }}
      />
    );
  }
}

export class InsertSpacer extends React.Component<SpacerProps, SpacerState> {
  componentDidMount() {
    // TODO: only after grow
    // this.setState({
    //   grow: true
    // })
  }

  render() {
    if (!Builder.isEditing) {
      return null;
    }

    return (
      <BuilderStoreContext.Consumer>
        {({ state }) => {
          const spacer = state._spacer;
          if (!(spacer && spacer.subject === this.props.id)) {
            return null;
          }

          if (['top', 'left'].indexOf(spacer.direction) > -1 && this.props.position === 'after') {
            return null;
          }
          if (
            ['bottom', 'right'].indexOf(spacer.direction) > -1 &&
            this.props.position === 'before'
          ) {
            return null;
          }

          const isHorizontal = ['left', 'right'].indexOf(spacer.direction) > -1;
          if (isHorizontal) {
            return null;
          }

          return (
            <Growser
              className="builder__spacer"
              css={{
                // width: 0,
                width: '100%',
                alignSelf: 'stretch',
                backgroundColor: 'rgba(28, 151, 204, 0.2)',
                pointerEvents: 'none',
                borderRadius: 4,
                transition: 'all 0.2s cubic-bezier(.37,.01,0,.98) !important',
                border: '1px solid rgba(28, 151, 204, 0.4)',
                // ...(this.state.grow && {
                //   width: '100%',
                //   height: 30
                // })
              }}
            />
          );
        }}
      </BuilderStoreContext.Consumer>
    );
  }
}
