import { BuilderContent, fetchOneEntry } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ProductDetails() {
  const [productDetails, setProductDetails] = useState<BuilderContent | null>(
    null
  );

  const { handle } = useParams();

  useEffect(() => {
    fetchOneEntry({
      model: 'product-details',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      query: {
        'data.handle': handle,
      },
    }).then((productData) => {
      setProductDetails(productData);
    });
  }, [handle]);

  if (!productDetails) {
    return <p>Loading product details...</p>;
  }

  return (
    <div className="product-details">
      <h1>{productDetails.data?.name}</h1>
      <img src={productDetails.data?.image} alt={productDetails.data?.name} />
      <p>{productDetails.data?.collection.value.data.copy}</p>
      <p>Price: {productDetails.data?.collection.value.data.price}</p>
    </div>
  );
}
