import { getProps } from '@e2e/tests';
import {
  NavigationContainer,
  NavigationContext,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { RenderContent, _processContentResult } from './sdk-src';

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

const BuilderContent = () => {
  const navigationContext = useContext(NavigationContext);
  const [props, setProps] = useState(undefined);
  const currentRoute =
    navigationContext.getState().routes[navigationContext.getState().index];

  useEffect(() => {
    getProps({
      pathname: currentRoute.path || '/',
      _processContentResult,
    }).then((resp) => {
      setProps(resp);
    });
  }, []);

  return (
    <View
      style={{
        // mimick body stylesheets from the web
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {props ? <RenderContent {...props} /> : <Text>Not Found.</Text>}
    </View>
  );
};

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
