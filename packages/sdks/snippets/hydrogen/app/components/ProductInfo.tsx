import {Image} from '@shopify/hydrogen';

export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
};

export default function ProductInfo({product}: {product: Product}) {
  if (!product) return null;
  console.log(product);

  return (
    <>
      <div className="product-image">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="product-info">
        <h2>{product.title}</h2>
        <p>{product.description}</p>
        <p>Price: {product.price} $</p>
        <p>Rating: {product.rating?.rate} / 5</p>
        <button>Buy now</button>
      </div>
    </>
  );
}
