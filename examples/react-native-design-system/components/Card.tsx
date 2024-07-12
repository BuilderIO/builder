import { registerComponent } from '@builder.io/sdk-react-native';
import React from 'react';
import { Box, Heading, AspectRatio, Image, Text, Center, HStack, Stack } from 'native-base';

export default function Card(props: {
  image: string;
  imageLabel: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <Box
      p="2"
      rounded="lg"
      borderColor="coolGray.200"
      borderWidth="1"
      _dark={{
        borderColor: 'coolGray.600',
        backgroundColor: 'gray.700',
      }}
      _web={{
        shadow: 2,
        borderWidth: 0,
      }}
      _light={{
        backgroundColor: 'gray.50',
      }}
    >
      <Box>
        <AspectRatio w="100%" ratio={16 / 9}>
          <Image
            key={props.image}
            source={{
              uri: props.image,
            }}
            alt="image"
          />
        </AspectRatio>
        <Center
          bg="violet.500"
          _dark={{
            bg: 'violet.400',
          }}
          _text={{
            color: 'warmGray.50',
            fontWeight: '700',
            fontSize: 'xs',
          }}
          position="absolute"
          bottom="0"
          px="3"
          py="1.5"
        >
          {props.imageLabel}
        </Center>
      </Box>
      <Stack p="4" space={3}>
        <Stack space={2}>
          <Heading size="md" ml="-1">
            {props.title}
          </Heading>
          <Text
            fontSize="xs"
            _light={{
              color: 'violet.500',
            }}
            _dark={{
              color: 'violet.400',
            }}
            fontWeight="500"
            ml="-0.5"
            mt="-1"
          >
            {props.subtitle}
          </Text>
        </Stack>
        <Text maxHeight="40vh" overflow="hidden" fontWeight="400">
          {props.description}
        </Text>
      </Stack>
    </Box>
  );
}

registerComponent(Card, {
  image: 'https://unpkg.com/css.gg@2.0.0/icons/svg/inpicture.svg',
  name: 'Card',
  inputs: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Your Card Title',
    },
    {
      name: 'subtitle',
      type: 'text',
      required: true,
      defaultValue: 'Your Card Subtitle',
    },
    {
      name: 'description',
      type: 'text',
      defaultValue: 'Your Card Description',
      required: true,
    },
    ,
    {
      name: 'imageLabel',
      type: 'text',
      defaultValue: 'Special Offer',
      required: true,
    },
    {
      name: 'image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F52dcecf48f9c48cc8ddd8f81fec63236',
    },
  ],
});
