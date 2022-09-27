import * as React from 'react';
import { Text } from 'react-native';
import BuilderContext from '../context/builder.context';

/**
 * Implements CSS-like inheritance for `Text` by replacing all calls to `Text` with a custom `BaseText` component that
 * applies the `inheritedStyles` context styles, which contain all styles from all parents that might apply to a `Text`.
 */
export default function BaseText(props) {
  const builderContext = React.useContext(BuilderContext);
  return (
    <Text
      {...props}
      style={{ ...builderContext.inheritedStyles, ...props.style }}
    />
  );
}
