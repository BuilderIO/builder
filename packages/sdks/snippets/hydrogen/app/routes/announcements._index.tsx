import type {LoaderFunction} from '@remix-run/node';
import AnnouncementBarPage, {
  announcementsLoader,
} from '~/components/AnnouncementBarPage';

export const loader: LoaderFunction = announcementsLoader;

export default AnnouncementBarPage;
