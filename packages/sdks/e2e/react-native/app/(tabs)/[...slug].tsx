import {
  Content,
  fetchOneEntry,
  isPreviewing,
} from '@builder.io/sdk-react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

const BUILDER_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

export default function HomeScreen() {
  const [content, setContent] = useState<any>(undefined);

  const { slug } = useLocalSearchParams<{ slug: string }>();

  useEffect(() => {
    fetchOneEntry({
      model: 'page',
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath: slug ? `/${slug}` : '/',
      },
    })
      .then((content) => {
        if (content) {
          setContent(content);
        }
      })
      .catch((err) => {
        console.error(
          'something went wrong while fetching Builder Content: ',
          err
        );
      });
  }, []);

  const shouldRenderBuilderContent = content || isPreviewing();

  return (
    <View>
      {shouldRenderBuilderContent ? (
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Content apiKey={BUILDER_API_KEY} model="page" content={content} />
        </View>
      ) : (
        <Text>Not Found.</Text>
      )}
    </View>
  );
}
