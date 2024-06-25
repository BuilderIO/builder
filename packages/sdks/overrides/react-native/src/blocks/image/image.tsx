import * as React from 'react';
import type { StyleProp,ImageStyle } from 'react-native';
import { Image as ReactImage, View } from 'react-native';
import type { ImageProps } from './image.types.js';

export default function Image(props: ImageProps) {
  const shouldRenderUnwrappedChildren =
    props.fitContent && props.builderBlock?.children?.length;

  const imageStyle:StyleProp<ImageStyle> = (props.aspectRatio
    ? {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }
    : {
        position: 'relative',
        ...(props.width ? { width: props.width } : {}),
        ...(props.height ? { height: props.height } : {}),
      } ) ;

  const paddingTop = `${props.aspectRatio * 100}%` as const;

  return (
    <>
      <React.Fragment>
        <ReactImage
          resizeMode={props.backgroundSize || 'contain'}
          style={imageStyle}
          source={{ uri: props.image }}
        />
        {props.aspectRatio && !shouldRenderUnwrappedChildren ? (
          <View
            style={{
              width: '100%',
              paddingTop,
            }}
          />
        ) : null}
      </React.Fragment>

      {shouldRenderUnwrappedChildren && props.children}

      {!props.fitContent && props.children && (
        // When `fitContent: false`, we wrap image children ssuch that they stretch across the entire image
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {props.children}
        </View>
      )}
    </>
  );
}
