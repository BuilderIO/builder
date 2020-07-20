import { Builder } from '@builder.io/sdk';
import { collectionGrid } from '../blocks/product-collection';
import {
  addToCart,
  productBoxBlock,
  productImage,
  productPrice,
  productVariants,
  productTitle,
} from '../blocks/product-info';
import { el } from '../modules/blocks';

const SHOPIFY_SECTION_NAME = 'Shopify';

Builder.register('insertMenu', {
  name: SHOPIFY_SECTION_NAME,
  priority: 100,
  items: [
    {
      name: 'Product Box',
      icon:
        'https://cdn.builder.io/api/v1/image/assets%2Fd4fb2d0e6f954b31b60f6f0573e91b0c%2Fff2fd04bad384f30837b40bda8a062dc',
      item: productBoxBlock,
    },
    {
      name: 'Collection',
      icon:
        'https://cdn.builder.io/api/v1/image/assets%2Fd4fb2d0e6f954b31b60f6f0573e91b0c%2Ff674f219499c47bbb765c470483b91ca',
      item: collectionGrid,
    },
    {
      name: 'Product Title',
      item: productTitle,
      icon:
        'https://cdn.builder.io/api/v1/image/assets%2Fd4fb2d0e6f954b31b60f6f0573e91b0c%2F3b38ddf58f874b75b059a6a350da045d',
    },
    {
      name: 'Product Image',
      icon:
        'https://cdn.builder.io/api/v1/image/assets%2Fd4fb2d0e6f954b31b60f6f0573e91b0c%2F6a1f446e6f4d4949ad2df09e9434896b',
      item: productImage,
    },
    {
      name: 'Product Price',
      icon:
        'https://cdn.builder.io/api/v1/image/assets%2Fd4fb2d0e6f954b31b60f6f0573e91b0c%2Fa9ddc6c386e94b1ebdccbc6020ebd8a0',
      item: productPrice,
    },
    {
      name: 'Description',
      icon:
        'https://cdn.builder.io/api/v1/image/assets%2Fd4fb2d0e6f954b31b60f6f0573e91b0c%2F0fd880c4e1ba452cb46eeac3818d5ab1',
      item: el({
        layerName: 'Product description',
        bindings: { 'component.options.text': 'productInfo.body_html' },
        component: { name: 'Text' },
      }),
    },
    {
      name: 'Variants',
      icon:
        'https://cdn.builder.io/api/v1/image/assets%2Fd4fb2d0e6f954b31b60f6f0573e91b0c%2F9538ae3794ac4567b24a87f89def46d9',
      item: productVariants,
    },
    {
      name: 'Add to cart',
      icon:
        'https://cdn.builder.io/api/v1/image/assets%2Fd4fb2d0e6f954b31b60f6f0573e91b0c%2F3764c37720244a29966aecc7516104fe',
      item: addToCart,
    },
  ],
});
