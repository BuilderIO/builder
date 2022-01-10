import { builder } from '@builder.io/sdk';

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  NativeBaseProvider,
  Button,
  Box,
  HamburgerIcon,
  Pressable,
  Heading,
  VStack,
  Text,
  Center,
  HStack,
  Divider,
  Icon,
  Avatar,
} from 'native-base';
import RenderBuilderScreen from './components/RenderBuilderScreen';
const Drawer = createDrawerNavigator();

builder.init('22aaa183038348eab0ef1f933ee4a469');
builder.setUserAttributes({
  screen: 'home',
});

function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props}>
      <VStack space="6" my="2" mx="1">
        <Center>
          <Avatar size="lg"></Avatar>
        </Center>
        <VStack divider={<Divider />} space="4">
          <VStack space="3">
            {props.state.routeNames.map((name, index) => (
              <Pressable
                key={name}
                px="5"
                py="3"
                rounded="md"
                bg={index === props.state.index ? 'rgba(6, 182, 212, 0.1)' : 'transparent'}
                onPress={event => {
                  props.navigation.navigate(name);
                }}
              >
                <HStack space="7" alignItems="center">
                  <Icon
                    color={index === props.state.index ? 'primary.500' : 'gray.500'}
                    size="5"
                    as={<FontAwesome name="info" />}
                  />
                  <Text
                    fontWeight="500"
                    color={index === props.state.index ? 'primary.500' : 'gray.700'}
                  >
                    {name}
                  </Text>
                </HStack>
              </Pressable>
            ))}
          </VStack>
          <VStack space="5">
            <Text fontWeight="500" fontSize="14" px="5" color="gray.500">
              Audience
            </Text>
            <VStack space="3">
              <Pressable
                onPress={() => {
                  props.navigation.closeDrawer();
                  builder.setUserAttributes({
                    audience: 'male',
                  });
                }}
                px="5"
                py="3"
              >
                <HStack space="7" alignItems="center">
                  <Icon color="gray.500" size="5" as={<FontAwesome name="male" />} />
                  <Text color="gray.700" fontWeight="500">
                    Male
                  </Text>
                </HStack>
              </Pressable>
              <Pressable
                onPress={() => {
                  props.navigation.closeDrawer();

                  builder.setUserAttributes({
                    audience: 'female',
                  });
                }}
                px="5"
                py="2"
              >
                <HStack space="7" alignItems="center">
                  <Icon color="gray.500" size="5" as={<FontAwesome name="female" />} />
                  <Text color="gray.700" fontWeight="500">
                    Female
                  </Text>
                </HStack>
              </Pressable>
              <Pressable
                onPress={() => {
                  props.navigation.closeDrawer();
                  builder.setUserAttributes({
                    audience: '',
                  });
                }}
                px="5"
                py="3"
              >
                <HStack space="7" alignItems="center">
                  <Icon color="gray.500" size="5" as={<MaterialCommunityIcons name="set-none" />} />
                  <Text fontWeight="500" color="gray.700">
                    None
                  </Text>
                </HStack>
              </Pressable>
            </VStack>
          </VStack>
        </VStack>
      </VStack>
    </DrawerContentScrollView>
  );
}
function MyDrawer() {
  return (
    <Box safeArea flex={1}>
      <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
        <Drawer.Screen name="home" component={RenderBuilderScreen} />
        <Drawer.Screen name="latest arrival" component={RenderBuilderScreen} />
      </Drawer.Navigator>
    </Box>
  );
}
export default function App() {
  return (
    <NavigationContainer>
      <NativeBaseProvider>
        <MyDrawer />
      </NativeBaseProvider>
    </NavigationContainer>
  );
}
