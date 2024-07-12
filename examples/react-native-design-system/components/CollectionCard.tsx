// "apiPassword": "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", "storefrontAccessToken": "dd0057d1e48d2d61ca8ec27b07d3c5e6", "storeDomain": "builder-io-demo.myshopify.com/", "apiKey": "14f064d7f94eeaadf93bd8690fca1207"

import { registerComponent } from '@builder.io/sdk-react-native';
import React, { useEffect, useState } from 'react';
import Client from 'shopify-buy';
import { Box, Heading, AspectRatio, Image, Text, Center, HStack, Stack } from 'native-base';
import Swiper from 'react-native-web-swiper';
import Card from './Card';

interface Collection {
  title: string;
  description: string;
  products: Array<Client.Product & { handle: string }>;
}

// Initializing a client to return content in the store's primary language
const client = Client.buildClient({
  domain: 'builder-io-demo.myshopify.com',
  storefrontAccessToken: 'dd0057d1e48d2d61ca8ec27b07d3c5e6',
});

export default function CollectionCard(props: {
  collectionHandle: string;
  label: string;
  subtitle: string;
}) {
  const [collection, setCollection] = useState<Collection | null>(null);
  useEffect(() => {
    async function fetchCollection() {
      const response: any = await client.collection.fetchByHandle(props.collectionHandle);
      console.log(' here response is ', response);
      setCollection(response);
    }
    fetchCollection();
  }, [props.collectionHandle]);

  if (!collection) {
    return <Text>Pick a collection to show</Text>;
  }
  return (
    <Box
      p="2"
      mb="12"
      rounded="lg"
      overflow="hidden"
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
      <Stack p="4" space={3}>
        <Stack space={2}>
          <Heading size="md" ml="-1">
            {collection.title}
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
        <Text fontWeight="400">{collection.description}</Text>
      </Stack>
      <Box w="100%" h="80vh">
        <Swiper key={props.label}>
          {collection.products.map(product => (
            <Card
              key={product.id}
              description={product.description}
              imageLabel={props.label}
              subtitle=""
              title={product.title}
              image={product.images[0].src}
            ></Card>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
}

registerComponent(CollectionCard, {
  image: 'https://unpkg.com/css.gg@2.0.0/icons/svg/collage.svg',
  name: 'CollectionCard',
  inputs: [
    {
      name: 'collectionHandle',
      friendlyName: 'Collection',
      type: 'ShopifyCollectionHandle',
      required: true,
      defaultValue: 'spring',
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      defaultValue: 'On Sale',
    },
    {
      name: 'subtitle',
      type: 'text',
      required: true,
      defaultValue: 'Collection subtitle',
    },
  ],
});
