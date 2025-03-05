import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AnnouncementBar from './routes/AnnouncementBar.tsx';
import ProductDetails from './routes/blueprints/ProductDetails.tsx';
import AdvancedChildRoute from './routes/custom-components/advanced-child.tsx';
import CustomChildRoute from './routes/custom-components/custom-child.tsx';
import EditableRegionRoute from './routes/custom-components/editable-region.tsx';
import IntegratingPages from './routes/IntegratingPages.tsx';
import LivePreviewBlogData from './routes/LivePreviewBlogData.js';
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
    path: '/custom-child',
    element: <CustomChildRoute />,
  },
  {
    path: '/advanced-child',
    element: <AdvancedChildRoute />,
  },
  {
    path: '/live-preview',
    element: <LivePreviewBlogData />,
  },
  {
    path: '/product/category/jacket',
    element: <ProductDetails />,
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
