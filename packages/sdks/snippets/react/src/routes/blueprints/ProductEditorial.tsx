import { BuilderContent, Content, fetchOneEntry } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';
import ProductFooter from '../../components/ProductFooter';
import ProductHeader from '../../components/ProductHeader';
import ProductInfo from '../../components/ProductInfo';

const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL_NAME = 'product-editorial';

export default function ProductEditorial() {
  const [product, setProduct] = useState(null);
  const [editorial, setEditorial] = useState<BuilderContent | null>(null);
  const [productId, setProductId] = useState('');

  useEffect(() => {
    const id = window.location.pathname.split('/').pop() || '';
    setProductId(id);

    if (productId) {
      fetchProductAndEditorial(productId);
    }
  }, [productId]);

  async function fetchProductAndEditorial(id: string) {
    try {
      const prodData = await fetch(
        `https://fakestoreapi.com/products/${id}`
      ).then((res) => res.json());
      setProduct(prodData);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }

    try {
      const content = await fetchOneEntry({
        model: MODEL_NAME,
        apiKey: API_KEY,
        userAttributes: { urlPath: window.location.pathname || '/' },
      });
      setEditorial(content);
    } catch (error) {
      console.error('Error fetching editorial content:', error);
    }
  }

  return (
    <>
      <ProductHeader />
      <ProductInfo product={product} />
      {editorial && (
        <Content model={MODEL_NAME} content={editorial} apiKey={API_KEY} />
      )}
      <ProductFooter />
    </>
  );
}
