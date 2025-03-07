import { BuilderContent, fetchOneEntry } from '@builder.io/sdk-react';
import React, { useEffect, useState } from 'react';

export default function ProductDetails() {
  const [productDetails, setProductDetails] = useState<BuilderContent | null>(
    null
  );

  useEffect(() => {
    fetchOneEntry({
      model: 'product-details',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      query: {
        'data.handle': 'jacket',
      },
    }).then((productData) => {
      setProductDetails(productData);
    });
  }, []);

  if (!productDetails) {
    return <p>Loading product details...</p>;
  }

  return (
    <div className="product-details">
      <h1>{productDetails.data?.name}</h1>
      <img
        src={productDetails.data?.image}
        alt={productDetails.data?.name}
        width="400"
        height="500"
      />
      <p>{productDetails.data?.collection.value.data.copy}</p>
      <p>Price: {productDetails.data?.collection.value.data.price}</p>
    </div>
  );
}
