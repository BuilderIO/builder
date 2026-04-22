import {
  Content,
  _processContentResult,
  fetchOneEntry,
  registerAction,
} from '@builder.io/sdk-react-native';
import { getProps } from '@sdk/tests';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  const [props, setProps] = useState<any>(undefined);
  const { slug } = useLocalSearchParams<{ slug: string }>();

  useEffect(() => {
    getProps({
      pathname: slug ? `/${slug}` : '/',
      _processContentResult,
      fetchOneEntry,
    }).then((resp) => {
      setProps(resp);
    });
    if (typeof window !== 'undefined') {
      registerAction({
        name: 'test-action',
        kind: 'function',
        id: 'test-action-id',
        inputs: [
          {
            name: 'actionName',
            type: 'string',
            required: true,
            helperText: 'Action name',
          },
        ],
        action: () => {
          return `console.log("function call") `;
        },
      });
    }
  }, []);

  return (
    <View
      style={{
        // mimick body stylesheets from the web
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {props ? (
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Content {...props} />
        </View>
      ) : (
        <Text>Not Found.</Text>
      )}
    </View>
  );
}
