import * as React from 'react';
import {Text} from 'react-native'
import BuilderContext from '../context/builder.context';

export default function BaseText(props) {
  const builderContext = React.useContext(BuilderContext);
  return (
    <Text {...props} style={{ ...builderContext.inheritedStyles, ...props.style}}/>
  );
}
