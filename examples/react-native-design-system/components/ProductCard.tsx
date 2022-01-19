// "apiPassword": "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", "storefrontAccessToken": "dd0057d1e48d2d61ca8ec27b07d3c5e6", "storeDomain": "builder-io-demo.myshopify.com/", "apiKey": "14f064d7f94eeaadf93bd8690fca1207"

import { registerComponent } from '@builder.io/sdk-react-native';
import React, { useEffect, useState } from 'react';
import Client from 'shopify-buy';
import { Box, Heading, AspectRatio, Image, Text, Center, HStack, Stack } from 'native-base';
import Swiper from 'react-native-web-swiper';

// Initializing a client to return content in the store's primary language
const client = Client.buildClient({
  domain: 'builder-io-demo.myshopify.com',
  storefrontAccessToken: 'dd0057d1e48d2d61ca8ec27b07d3c5e6',
});

export default function ProductCard(props: {
  productHandle: string;
  label: string;
  subtitle: string;
}) {
  const [product, setProduct] = useState<Client.Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    async function fetchProduct() {
      if (props.productHandle) {
        setLoading(true);
        const response = await client.product.fetchByHandle(props.productHandle);
        setProduct(response);
        setLoading(false);
      }
    }
    fetchProduct();
  }, [props.productHandle]);

  if (loading) {
    // todo: indicator
    return null;
  }

  if (!product) {
    return <Text>Pick a product to show</Text>;
  }
  return (
    <Box
      p="2"
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
      <Box>
        <AspectRatio w="100%" ratio={16 / 9}>
          <Swiper>
            {product.images.map(image => (
              <AspectRatio w="100%" ratio={16 / 9}>
                <Image
                  source={{
                    uri: image.src,
                  }}
                  alt="image"
                />
              </AspectRatio>
            ))}
          </Swiper>
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
          {props.label}
        </Center>
      </Box>
      <Stack p="4" space={3}>
        <Stack space={2}>
          <Heading size="md" ml="-1">
            {product.title}
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
        <Text fontWeight="400">{product.description}</Text>
      </Stack>
    </Box>
  );
}

registerComponent(ProductCard, {
  image: 'https://unpkg.com/css.gg@2.0.0/icons/svg/ereader.svg',
  name: 'ProductCard',
  inputs: [
    {
      name: 'productHandle',
      friendlyName: 'Product',
      type: 'ShopifyProductHandle',
      required: true,
      defaultValue: '',
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      defaultValue: 'On Sale',
    },
  ],
});
