import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AnnouncementBar from './routes/AnnouncementBar';
import IntegratingPages from './routes/IntegratingPages';

const router = createBrowserRouter([
  {
    path: '/announcements/:id',
    element: <AnnouncementBar />,
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
