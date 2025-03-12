import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdvancedChild from './routes/advanced-child';
import AnnouncementBar from './routes/AnnouncementBar';
import CustomChild from './routes/custom-child';
import EditableRegion from './routes/editable-region';
import IntegratingPages from './routes/IntegratingPages';
import QueryCheatsheet from './routes/query-cheatsheet';
import TargetedPage from './routes/targeted-page';
import TargetedPageSetAttributes from './routes/targeted-page/set-attributes';

const router = createBrowserRouter([
  {
    path: '/editable-region',
    element: <EditableRegion />,
  },
  {
    path: '/advanced-child',
    element: <AdvancedChild />,
  },
  {
    path: '/custom-child',
    element: <CustomChild />,
  },
  {
    path: '/announcements/:id',
    element: <AnnouncementBar />,
  },
  {
    path: '/targeted-page',
    element: <TargetedPage />,
  },
  {
    path: '/targeted-page-set-attributes',
    element: <TargetedPageSetAttributes />,
  },
  {
    path: '/query-cheatsheet',
    element: <QueryCheatsheet />,
  },
  {
    path: '/*',
    element: <IntegratingPages />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
