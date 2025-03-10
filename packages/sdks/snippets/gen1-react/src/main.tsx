import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdvancedChild from './routes/advanced-child';
import AnnouncementBar from './routes/AnnouncementBar';
import CustomChild from './routes/custom-child';
import EditableRegion from './routes/editable-region';
import IntegratingPages from './routes/IntegratingPages';
import QueryCheatsheet from './routes/query-cheatsheet';

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
