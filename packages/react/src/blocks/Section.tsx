/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { BuilderElement } from '@builder.io/sdk';
import { BuilderBlock as BuilderBlockComponent } from '../components/builder-block.component';
import { withBuilder } from '../functions/with-builder';

interface SectionProps {
  builderBlock?: BuilderElement;
  verticalAlignContent?: string;
  maxWidth?: number;
  lazyLoad?: boolean;
  // Styles to load before lazy loaded in, like a min height
  lazyStyles?: any;
}

class SectionComponent extends React.Component<SectionProps, { inView?: boolean }> {
  ref: HTMLElement | null = null;

  unmountCallbacks: Function[] = [];

  state = {
    inView: false,
  };

  get renderContents() {
    if (this.props.lazyLoad !== true) {
      return true;
    }

    return this.state.inView;
  }

  componentWillUnmount() {
    this.unmountCallbacks.forEach(cb => cb());
  }

  componentDidMount() {
    if (this.props.lazyLoad) {
      if (typeof IntersectionObserver === 'undefined' || !this.ref) {
        this.setState({ inView: true });
      } else {
        const observer = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
              this.setState({
                inView: true,
              });
              if (this.ref) {
                observer.unobserve(this.ref);
              }
            }
          });
        });

        observer.observe(this.ref);

        this.unmountCallbacks.push(() => {
          if (this.ref) {
            observer.unobserve(this.ref);
          }
        });
      }
    }
  }

  render() {
    return (
      <section
        ref={ref => (this.ref = ref)}
        css={{
          width: '100%',
          // height: '100%' was is here so the inner contents can align center, but that is causing
          // issues in Safari. Need another workaround.
          alignSelf: 'stretch',
          flexGrow: 1,
          boxSizing: 'border-box',
          maxWidth: this.props.maxWidth,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          marginLeft: 'auto',
          marginRight: 'auto',
          ...(this.renderContents ? null : this.props.lazyStyles),
        }}
      >
        {this.renderContents ? (
          <React.Fragment>
            {this.props.children}
            {this.props.builderBlock &&
              this.props.builderBlock.children &&
              this.props.builderBlock.children.map((block, index) => (
                <BuilderBlockComponent key={block.id} block={block} />
              ))}
          </React.Fragment>
        ) : null}
      </section>
    );
  }
}

export const Section = SectionComponent;
