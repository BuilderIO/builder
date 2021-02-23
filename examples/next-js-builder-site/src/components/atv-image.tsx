/* eslint-disable */

import React, { Component } from 'react';
import { CSSPropertiesWithMultiValues } from '@emotion/serialize';

export interface AtvImgProps {
  layers?: string[];
  isStatic?: boolean;
  staticFallback?: string;
  className?: string;
  noZoom?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  heightMultiple?: number;
  widthMultiple?: number;
}

export default class AtvImg extends Component<AtvImgProps> {
  state = {
    rootElemWidth: 0,
    rootElemHeight: 0,
    isOnHover: false,
    container: {},
    shine: {},
    layers: [],
  };

  root: HTMLDivElement | null = null;

  componentDidMount() {
    if (!this.props.isStatic) {
      this.setState({
        // eslint-disable-line react/no-did-mount-set-state
        // this is a legit use case. we must trigger a re-render. don't worry.
        rootElemWidth:
          this.root!.clientWidth ||
          this.root!.offsetWidth ||
          this.root!.scrollWidth,
        rootElemHeight:
          this.root!.clientHeight ||
          this.root!.offsetHeight ||
          this.root!.scrollHeight,
      });
    }
  }

  handleMove = ({ pageX, pageY }: any) => {
    const layerCount = (this.props.layers && this.props.layers.length) || 0; // the number of layers

    const { rootElemWidth, rootElemHeight } = this.state;

    const bodyScrollTop =
      document.body.scrollTop ||
      document.getElementsByTagName('html')[0].scrollTop;
    const bodyScrollLeft = document.body.scrollLeft;
    const offsets = this.root!.getBoundingClientRect();
    const wMultiple = (this.props.widthMultiple || 320) / rootElemWidth;
    const hMultiple = (this.props.heightMultiple || 320) / rootElemHeight;
    const offsetX =
      0.52 - (pageX - offsets.left - bodyScrollLeft) / rootElemWidth; // cursor position X
    const offsetY =
      0.52 - (pageY - offsets.top - bodyScrollTop) / rootElemHeight; // cursor position Y
    const dy = pageY - offsets.top - bodyScrollTop - rootElemHeight / 2; // center Y of container
    const dx = pageX - offsets.left - bodyScrollLeft - rootElemWidth / 2; // center X of container
    const yRotate = (offsetX - dx) * (0.07 * hMultiple); // rotation for container Y
    const xRotate = (dy - offsetY) * (0.07 * wMultiple); // rotation for container X

    const arad = Math.atan2(dy, dx); // angle between cursor and center of container in RAD

    const rawAngle = (arad * 180) / Math.PI - 90; // convert rad to degrees
    const angle = rawAngle < 0 ? rawAngle + 360 : rawAngle;

    const scaleFactor = 1 + 5 / rootElemWidth;

    this.setState({
      container: {
        transform: !this.state.isOnHover
          ? 'none'
          : `rotateX(${xRotate}deg) rotateY(${yRotate}deg)${
              this.state.isOnHover
                ? ` scale3d(${scaleFactor},${scaleFactor},${scaleFactor})`
                : ''
            }`,
      },
      shine: {
        background: `linear-gradient(${angle}deg, rgba(255, 255, 255, ${
          ((pageY - offsets.top - bodyScrollTop) / rootElemHeight) * 0.4
        }) 0%, rgba(255, 255, 255, 0) 80%)`,
        opacity: this.state.isOnHover ? 1 : 0,
        transform: !this.state.isOnHover
          ? 'none'
          : `translateX(${offsetX * layerCount - 0.1}px) translateY(${
              offsetY * layerCount - 0.1
            }px)`,
      },
      layers:
        this.props.layers &&
        this.props.layers.map((_: any, idx: any) => ({
          transform: !this.state.isOnHover
            ? 'none'
            : `translateX(${
                offsetX * (layerCount - idx) * ((idx * 2.5) / wMultiple)
              }px) translateY(${
                offsetY * layerCount * ((idx * 2.5) / hMultiple)
              }px)`,
        })),
    });
  };

  handleTouchMove = (evt: any) => {
    evt.preventDefault();
    const { pageX, pageY } = evt.touches[0];
    this.handleMove({ pageX, pageY });
  };

  handleEnter = () => {
    this.setState({ isOnHover: true });
  };

  handleLeave = () => {
    this.setState({
      isOnHover: false,
      container: {},
      shine: {},
      layers: [],
    });
  };

  renderShadow = () => (
    <div
      css={{
        ...styles.shadow,
        ...(this.state.isOnHover ? styles.shadowOnHover : {}),
      }}
    />
  );

  renderLayers = () => (
    <div css={styles.layers}>
      {this.props.layers &&
        this.props.layers.map((imgSrc: string, idx: number) => (
          <div
            css={{
              backgroundImage: `url(${imgSrc})`,
              ...styles.renderedLayer,
              ...(this.props.noZoom && {
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }),
              ...(this.state.layers && this.state.layers[idx]
                ? this.state.layers[idx]
                : {}),
            }}
            key={idx}
          />
        ))}
      {this.props.children && (
        <div
          css={{
            background: '#f5f4ed',
            height: '100%',
          }}
        >
          {this.props.children}
        </div>
      )}
    </div>
  );

  renderShine = () => (
    <div
      css={{
        ...styles.shine,
        ...this.state.shine,
        opacity: this.state.isOnHover ? 1 : 0,
      }}
    />
  );

  render() {
    if (this.props.isStatic) {
      return (
        <div
          css={{
            ...styles.root,
          }}
          className={this.props.className || ''}
        >
          <img css={styles.staticFallback} src={this.props.staticFallback} />
        </div>
      );
    }

    return (
      <div
        css={{
          ...styles.root,
          transform: this.state.isOnHover
            ? `perspective(${this.state.rootElemWidth * 3}px)`
            : 'none',
        }}
        className={this.props.className}
        onClick={this.props.onClick}
        onMouseMove={this.handleMove}
        onMouseEnter={this.handleEnter}
        onMouseLeave={this.handleLeave}
        onTouchMove={this.handleTouchMove}
        onTouchStart={this.handleEnter}
        onTouchEnd={this.handleLeave}
        ref={(el) => (this.root = el)}
      >
        <div css={{ ...styles.container, ...this.state.container }}>
          {this.renderShadow()}
          {this.renderLayers()}
          {this.renderShine()}
        </div>
      </div>
    );
  }
}

const styles: { [key: string]: CSSPropertiesWithMultiValues } = {
  root: {
    borderRadius: 5,
    transformStyle: 'preserve-3d',
    WebkitTapHighlightColor: 'rgba(#000, 0)',
  },

  staticFallback: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 5,
    boxShadow: '0 2px 8px rgba(14, 21, 47, 0.25)',
  },

  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 5,
    transition: 'all 0.2s ease-out',
  },

  shadowOnHover: {
    boxShadow:
      '0 11px 25px rgba(14, 21, 47, 0.4), 0 4px 10px rgba(14, 21, 47, 0.4)',
  },

  layers: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    transformStyle: 'preserve-3d',
  },

  renderedLayer: {
    position: 'absolute',
    width: '104%',
    height: '104%',
    top: '-2%',
    left: '-2%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top',
    backgroundSize: '100%',
    backgroundColor: '#f5f4ed',
    transition: 'all 0.1s ease-out',
  },

  shadow: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    width: 'calc(100% - 20px)',
    height: 'calc(100% - 20px)',
    transition: 'all 0.2s ease-out',
  },

  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 5,
    transition: 'opacity 0.2s ease-in-out',
    background:
      'linear-gradient(135deg, rgba(255, 255, 255, .25) 0%, rgba(255, 255, 255, 0) 60%)',
  },
};
