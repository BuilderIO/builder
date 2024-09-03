import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AnnouncementBar from './routes/AnnouncementBar.tsx';
import EditableRegionRoute from './routes/editable-regions.tsx';
import IntegratingPages from './routes/IntegratingPages.tsx';

const router = createBrowserRouter([
  {
    path: '/announcements/:id',
    element: <AnnouncementBar />,
  },
  {
    path: '/editable-region',
    element: <EditableRegionRoute />,
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
