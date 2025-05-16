export type Product = {
  image: string;
  title: string;
  description: string;
  price: number;
  rating: { rate: number; count: number };
};

export function ProductInfo({ product }: { product: Product }) {
  if (!product) return null;

  return (
    <div>
      <div className="product-image">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="product-info">
        <h2>{product.title}</h2>
        <p>{product.description}</p>
        <p>Price: {product.price} $</p>
        <p>Rating: {product.rating.rate} / 5</p>
        <button>Buy now</button>
      </div>
    </div>
  );
}
