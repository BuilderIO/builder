import { registerCommercePlugin } from '../index';


registerCommercePlugin({
  name: 'Swell',
  id: '@builder.io/swell',
  settings: [{
    name: 'storeId',
    type: 'string',
    required: true,
    helperText:
      'Get your Store ID from swell store settings https://swell.store/docs/api/?javascript#authentication',
  }, {
    name: 'secretKey',
    type: 'string',
    required: true,
    helperText:
      'Get your Secret key from swell store settings https://swell.store/docs/api/?javascript#authentication',
  },
],
  ctaText: `Connect your swell.is store`
}, {
  searchProducts(search: string) {
    return [];
  },
  searchCollections(search: string) {
    return [];
  },
  getProductById(id: string | number) {
    return {
      id: '123',
      title: ' weseom',
      image: {
        src: '...'
      },
      handle: 'awesome-product'
    }
  },
  getProductByHandle(handle: string) {
    return {
      id: '123',
      title: ' weseom',
      image: {
        src: '...'
      },
      handle: 'awesome-product'
    }
  },
  getCollectionById(id: string | number) {
    return {
      id: '123',
      title: ' weseom',
      image: {
        src: '...'
      },
      handle: 'awesome-collection'
    }
  },
  getCollectionByHandle(handle: string) {
    return {
      value: {
        id: '123',
        title: ' weseom',
        image: {
          src: '...'
        },
        handle: 'awesome-collection'
      },
      loading: false
    }
  },
  getProductRequestObject(productId: string | number) {
    return {}
  },
  getCollectionRequestObject(collectionId: string | number) {
    return {}
  }

})