import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import { RenderHTML } from 'react-native-render-html';
import BuilderContext from '../../context/builder.context';

/**
 * @typedef {{}} BuilderBlock
 */

/**
 *
 * @param {string} string
 * @returns {string}
 */
function camelToKebabCase(string) {
  return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 *
 * @param {object} object
 * @param {string[]} keys
 * @returns {object}
 */
function pick(object, keys) {
  return keys.reduce((obj, key) => {
    // eslint-disable-next-line no-prototype-builtins
    if (object && object.hasOwnProperty(key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
}

const PICK_STYLES = ['textAlign'];

/**
 * @param {BuilderBlock} block
 * @returns
 */
function getBlockStyles(block) {
  // TODO: responsive CSS using react native viewport width hooks
  const styles = {
    ...block.responsiveStyles?.large,
    ...block.styles,
  };

  if (block.responsiveStyles?.medium) {
    Object.assign(styles, block.responsiveStyles.medium);
  }
  if (block.responsiveStyles?.small) {
    Object.assign(styles, block.responsiveStyles.small);
  }

  return styles;
}

/**
 *
 * @param {BuilderBlock} block
 * @param {any} inheritedStyles
 * @returns
 */
function getCss(block, inheritedStyles) {
  const styleObject = {
    ...inheritedStyles,
    ...pick(getBlockStyles(block), PICK_STYLES),
  };
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

/**
 *
 * @param {{ text: string; builderBlock: BuilderBlock}} props
 * @returns
 */
export default function Text(props) {
  const { width } = useWindowDimensions();
  const builderContext = React.useContext(BuilderContext);

  return (
    <RenderHTML
      contentWidth={width}
      source={{
        html: `<div style="${getCss(
          props.builderBlock,
          builderContext.inheritedStyles
        )}">${props.text || ''}</div>`,
      }}
    />
  );
}
