import { Image as ReactImage } from 'react-native';

// Subset of Image props, many are irrelevant for native (such as altText, etc)
export interface ImageProps {
  image: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  // TODO: Implement support for custom aspect ratios
  aspectRatio?: number;
  // TODO: support children
  children?: any;
}

// TODO: support children
export function Image(props: ImageProps) {
  return (
    <ReactImage
      style={{
        opacity: '1',
        transition: 'opacity 0.2s ease-in-out',
        objectFit: 'cover',
        objectPosition: 'center',
      }}
      source={props.image}
    />
  );
}
