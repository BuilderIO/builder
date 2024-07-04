import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';

const root = document.getElementById('root');

import App from './App';
import AnnouncementBar from './components/AnnouncementBar';

const routes = [
  {
    path: '/announcements/:id',
    component: AnnouncementBar,
  },
  {
    path: '*',
    component: App,
  },
];

render(() => <Router explicitLinks>{routes}</Router>, root!);
