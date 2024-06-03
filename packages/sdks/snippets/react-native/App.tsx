/**
 * Quickstart snippet
 * snippets/react-native/App.tsx
 */
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-react-native';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

/**
 * @typedef {import('@react-navigation/native').LinkingOptions} LinkingOptions
 */
const linking = {
  prefixes: ['http://localhost:19006'],
  config: {
    screens: {
      Page: {
        path: ':page?',
      },
    },
  },
};

const BUILDER_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';
const MODEL_NAME = 'page';

const BuilderContent = () => {
  const route = useRoute();
  const [content, setContent] = useState<BuilderContent | null>(null);

  useEffect(() => {
    fetchOneEntry({
      model: MODEL_NAME,
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath: route.path || '/',
      },
    })
      .then((data) => {
        setContent(data);
      })
      .catch((err) => console.error('Error fetching Builder Content: ', err));
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>
        Hello from your React Native codebase. Below is your Builder content:
      </Text>
      {content ? (
        <Content
          apiKey={BUILDER_API_KEY}
          model={MODEL_NAME}
          content={content}
        />
      ) : (
        <Text>Not Found.</Text>
      )}
    </View>
  );
};

// To use different paths, we need a way to navigate
// here we are using react-navigation
const Stack = createNativeStackNavigator();

const App = () => (
  <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
    <Stack.Navigator
      initialRouteName="Page"
      screenOptions={{
        contentStyle: { backgroundColor: 'white' },
        headerShown: false,
      }}
    >
      <Stack.Screen name="Page" component={BuilderContent} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
