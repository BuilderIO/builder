export default function ProductInfoComponent({ product }: { product: any }) {
  if (!product) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '200px',
        maxWidth: '1200px',
        margin: '1rem auto',
      }}
    >
      <div className="product-image">
        <img
          src={product.image}
          alt={product.title}
          style={{ width: 300, height: 300 }}
        />
      </div>
      <div className="product-info">
        <h2>{product.title}</h2>
        <p>{product.description}</p>
        <p>Price: {product.price} $</p>
        <p>Rating: {product.rating?.rate} / 5</p>
        <button>Buy now</button>
      </div>
    </div>
  );
}
