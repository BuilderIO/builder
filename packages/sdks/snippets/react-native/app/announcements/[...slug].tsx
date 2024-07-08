/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * app/announcements/[...slug].tsx
 */
import type { BuilderContent } from '@builder.io/sdk-react-native';
import { Content, fetchOneEntry } from '@builder.io/sdk-react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL_NAME = 'announcement-bar';

export default function AnnouncementScreen() {
  const [content, setContent] = useState<BuilderContent | null>(null);
  const { slug } = useLocalSearchParams<{ slug: string }>();

  useEffect(() => {
    fetchOneEntry({
      model: MODEL_NAME,
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath: `/announcements/${slug}`,
      },
    })
      .then((data) => {
        setContent(data);
      })
      .catch((err) => console.error('Error fetching Builder Content: ', err));
  }, []);

  return (
    <View>
      {content ? (
        <Content
          apiKey={BUILDER_API_KEY}
          model={MODEL_NAME}
          content={content}
        />
      ) : (
        <Text>Announcement Bar not Found</Text>
      )}
      {/* Your content coming from your app (or also Builder) */}
      <Text>The rest of your page goes here</Text>
    </View>
  );
}
