import type {LoaderFunction} from '@remix-run/node';
import ProductDetailsPage, {
  productDetailsLoader,
} from '~/components/ProductDetailsPage';

export const loader: LoaderFunction = productDetailsLoader;

export default ProductDetailsPage;
