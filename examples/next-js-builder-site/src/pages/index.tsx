import { GetStaticPaths, GetStaticProps } from 'next';
import { getBuilderStaticPaths } from '../functions/get-builder-static-paths';
import { getBuilderStaticProps } from '../functions/get-builder-static-props';
import LandingPage from './[...page]';

export const getStaticProps: GetStaticProps = async (context) => {
  return getBuilderStaticProps('content-page', context);
};

export default LandingPage;
