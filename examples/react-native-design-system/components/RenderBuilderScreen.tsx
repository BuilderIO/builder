import { RenderContent, registerComponent, isEditing } from '@builder.io/sdk-react-native';
import * as React from 'react';
import './Card';
import './ProductCard';
import './CollectionCard';
import './Video';
import { builder } from '@builder.io/sdk';

export default function RenderBuilderScreen(props: { route: { name: string } }) {
  const [content, setContent] = React.useState<any>(undefined);

  React.useEffect(() => {
    // simple example: fetches a content entry from your "Screen" model whose targeting the current route.
    if (isEditing()) {
      return;
    }
    async function fetchContent() {
      console.log(
        ' here fetching content ',
        props.route,
        props.route.name,
        builder.getUserAttributes()
      );
      const result = await builder
        .get('screen', {
          prerender: false,
          userAttributes: {
            ...builder.getUserAttributes(),
            screen: props.route.name,
          },
        })
        .toPromise();
      setContent(result);
    }
    fetchContent();
  }, [props.route.name]);

  const shouldRenderBuilderContent = content || isEditing();
  console.log(' here content should render ', shouldRenderBuilderContent);
  return shouldRenderBuilderContent ? <RenderContent model="screen" content={content} /> : null;
}
