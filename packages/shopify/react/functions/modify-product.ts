const wrapImage = (img: any) => ({
  ...img,
  toString() {
    return img.src;
  },
  valueOf: () => img.src,
  aspect_ratio: img.width / img.height,
});

/**
 * Modify product JSON from Shopify APIs to behave more like liquid product objects
 */
export function modifyProduct(product: any) {
  product.images = product.images.map((item: any) => wrapImage(item));
  product.featured_image = product.images[0];
  product.variants.forEach((item: any) => (item.featured_image = product.featured_image));
  product.description = product.body_html;
  product.options_with_values = product.options;

  const minPriceVariation = product.variants.reduce((current: any, item: any) => {
    if (current === item) {
      return current;
    }
    const currentMin = parseFloat(current.price);
    const newMin = parseFloat(item.price);

    return currentMin <= newMin ? current : item;
  }, product.variants[0]);

  // TODO: other currencies
  product.price = minPriceVariation.price;

  // TODO: price_min, price_max, price_varies, other properties
  // here https://help.shopify.com/en/themes/liquid/objects/product#product-price

  return product;
}
