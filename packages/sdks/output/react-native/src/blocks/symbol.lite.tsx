import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useContext } from 'react';
import RenderContent from '../components/render-content.lite';
import BuilderContext from '../context/builder.context.lite';

export default function Symbol(props) {
  const builderContext = useContext(BuilderContext);

  return (
    <View className="builder-symbol">
      <RenderContent
        context={builderContext.context}
        data={props.symbol?.data}
        model={props.symbol?.model}
        content={props.symbol?.content}
      />
    </View>
  );
}
