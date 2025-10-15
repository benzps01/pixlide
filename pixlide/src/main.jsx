import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import SlideshowPage from './pages/SlideshowPage.jsx';
import ManagementPage from './pages/ManagementPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import './index.css';

// This structure is critical.
// 'App' is the parent element, and all other pages are rendered as its 'children'.
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <SlideshowPage />,
      },
      {
        path: '/manage',
        element: <ManagementPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);