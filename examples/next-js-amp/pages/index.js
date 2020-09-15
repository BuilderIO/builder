import Page, {
  getServerSideProps as getPageServerSideProps,
} from './[...slug]';

export const getServerSideProps = getPageServerSideProps;

export const config = { amp: 'hybrid' };

export default Page;
