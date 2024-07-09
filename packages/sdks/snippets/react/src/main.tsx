import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import AnnouncementBar from './components/AnnouncementBar.tsx';

const router = createBrowserRouter([
  {
    path: '/announcements/:id',
    element: <AnnouncementBar />,
  },
  {
    path: '/*',
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
