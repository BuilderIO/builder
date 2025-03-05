import { BuilderContent, fetchOneEntry } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

export default function ProductDetails() {
  const [productDetails, setProductDetails] = useState<BuilderContent | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;
    const fetchProductDetails = async () => {
      const productData = await fetchOneEntry({
        model: 'product-details',
        apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
        query: {
          'data.handle': 'jacket',
        },
      });
      if (isMounted) {
        setProductDetails(productData);
      }
    };
    fetchProductDetails();

    return () => {
      isMounted = false;
    };
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
