import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import React, { Fragment, useEffect, useState } from 'react';
import { getProps } from '@e2e/tests';
import {
  RenderContent,
  _processContentResult,
} from '@builder.io/sdk-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
      margin: 8,
    }}
  >
    <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
      <Stack.Navigator
        initialRouteName="Page"
        screenOptions={{ contentStyle: { backgroundColor: 'white' } }}
      >
        <Stack.Screen name="Page" options={{ headerShown: false }}>
          {({ route }) => <BuilderContent route={route} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  </View>
);

export default App;
