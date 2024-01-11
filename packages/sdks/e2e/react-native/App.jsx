import { getProps } from '@e2e/tests';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Fragment, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { RenderContent, _processContentResult } from './sdk-src';

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

/**
 *
 * @param {RouteProp<ParamListBase, "Page">} props
 */
const BuilderContent = ({ route }) => {
  const [props, setProps] = useState(undefined);

  useEffect(() => {
    getProps({ pathname: route.path || '/', _processContentResult }).then(
      (resp) => {
        setProps(resp);
      }
    );
  }, []);

  return (
    <Fragment>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {props ? <RenderContent {...props} /> : <Text>Not Found.</Text>}
      </View>
      <StatusBar style="auto" />
    </Fragment>
  );
};

const Stack = createNativeStackNavigator();

const App = () => (
  <View
    style={{
      // mimick body stylesheets from the web
      margin: 18,
      width: '100%',
      paddingTop: 50,
    }}
  >
    <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
      <Text>Before Builder</Text>
      <Stack.Navigator
        initialRouteName="Page"
        screenOptions={{ contentStyle: { backgroundColor: 'white' } }}
      >
        <Stack.Screen name="Page" options={{ headerShown: false }}>
          {({ route }) => <BuilderContent route={route} />}
        </Stack.Screen>
      </Stack.Navigator>
      <Text>After Builder</Text>
    </NavigationContainer>
  </View>
);

export default App;
