import {
  BuilderContent,
  Content,
  fetchOneEntry,
  isPreviewing,
} from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductFooter from '../../components/ProductFooter';
import ProductHeader from '../../components/ProductHeader';
import ProductInfo from '../../components/ProductInfo';

const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL_NAME = 'product-editorial';

export default function ProductEditorial() {
  const [product, setProduct] = useState(null);
  const [editorial, setEditorial] = useState<BuilderContent | null>(null);
  const { id } = useParams();

  useEffect(() => {
    Promise.all([
      fetch(`https://fakestoreapi.com/products/${id}`).then((res) =>
        res.json()
      ),
      fetchOneEntry({
        model: MODEL_NAME,
        apiKey: API_KEY,
        userAttributes: { urlPath: window.location.pathname },
      }),
    ]).then(([productData, editorialData]) => {
      setProduct(productData);
      setEditorial(editorialData);
    });
  }, [id]);

  if (!isPreviewing() && !product && !editorial) return <div>404</div>;

  return (
    <>
      <ProductHeader />
      <ProductInfo product={product} />
      {/* Render Builder content below */}
      <Content model={MODEL_NAME} content={editorial} apiKey={API_KEY} />
      <ProductFooter />
    </>
  );
}
