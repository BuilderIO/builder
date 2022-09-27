import * as React from 'react';
import { Image as ReactImage, View } from 'react-native';

// Subset of Image props, many are irrelevant for native (such as altText, etc)
export interface ImageProps {
  image: string;
  backgroundSize?: 'cover' | 'contain';
  backgroundPosition?: string;
  aspectRatio?: number;
  width?: number;
  height?: number;
  // TODO: support children
  children?: any;
}

// TODO: support children by wrapping in a View
export default function Image(props: ImageProps) {
  const shouldRenderUnwrappedChildren =
    props.fitContent && props.builderBlock?.children?.length;

  const imageStyle = props.aspectRatio
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
      };

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
              paddingTop: props.aspectRatio * 100 + '%',
            }}
          />
        ) : null}
      </React.Fragment>

      {shouldRenderUnwrappedChildren && props.children}

      {!props.fitContent && props.children && (
        // When `fitContent: false`, we wrap image children ssuch that they stretch across the entire image
        <View
          css={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            position: 'absolute',
            top: '0',
            left: '0',
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
