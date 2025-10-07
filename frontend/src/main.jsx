import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Slideshow from './components/Slideshow.jsx';
import UploadPage from './pages/UploadPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // <-- Import ProtectedRoute
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Public routes
      {
        path: '/',
        element: <Slideshow />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      // Protected routes are nested inside the ProtectedRoute element
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'upload',
            element: <UploadPage />,
          },
          // You could add other protected routes here, like a dashboard
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);