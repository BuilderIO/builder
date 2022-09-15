import * as React from 'react';
import type { BuilderBlock } from '../types/builder-block';
import HTML from 'react-native-render-html';

function camelToKebabCase(string: string) {
  return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

function pick(object: object, keys: string[]) {
  return keys.reduce((obj, key) => {
    // eslint-disable-next-line no-prototype-builtins
    if (object && object.hasOwnProperty(key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
}

const PICK_STYLES = ['textAlign'];

function getBlockStyles(block: BuilderBlock) {
  // TODO: responsive CSS using react native viewport width hooks
  const styles: any = {
    ...block.responsiveStyles?.large,
    ...(block as any).styles,
  };

  if (block.responsiveStyles?.medium) {
    Object.assign(styles, block.responsiveStyles.medium);
  }
  if (block.responsiveStyles?.small) {
    Object.assign(styles, block.responsiveStyles.small);
  }

  return styles;
}

function getCss(block: BuilderBlock) {
  const styleObject = pick(getBlockStyles(block), PICK_STYLES);
  if (!styleObject) {
    return '';
  }

  let str = ``;

  for (const key in styleObject) {
    const value = styleObject[key];
    if (typeof value === 'string') {
      str += `${camelToKebabCase(key)}: ${value};`;
    }
  }

  return str;
}

export default function Text(props: {
  text: string;
  builderBlock: BuilderBlock;
}) {
  return (
    <HTML
      source={{
        html: `<div style="${getCss(props.builderBlock)}">${
          props.text || ''
        }</div>`,
      }}
    />
  );
}
