import {
  _processContentResult,
  Content,
  fetchOneEntry,
} from '@builder.io/sdk-react-native';
import {
  NavigationContainer,
  NavigationContext,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getProps } from '@sdk/tests';
import { useContext, useEffect, useState } from 'react';
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

const BuilderContent = () => {
  const navigationContext = useContext(NavigationContext);
  const [props, setProps] = useState<any>(undefined);
  const currentRoute =
    navigationContext?.getState().routes[navigationContext.getState().index];

  useEffect(() => {
    getProps({
      pathname: currentRoute?.path || '/',
      _processContentResult,
      fetchOneEntry,
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
      {props ? <Content {...props} /> : <Text>Not Found.</Text>}
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
