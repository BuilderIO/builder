import type {LoaderFunction} from '@remix-run/node';
import BuilderPage, {builderLoader} from '~/components/app';

export const loader: LoaderFunction = builderLoader;

export default BuilderPage;
