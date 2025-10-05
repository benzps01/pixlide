import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Slideshow from './components/Slideshow.jsx';
import UploadPage from './pages/UploadPage.jsx';
import LoginPage from './pages/LoginPage.jsx'; // <-- Import LoginPage
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Slideshow />,
      },
      {
        path: 'upload',
        element: <UploadPage />, // We will protect this next
      },
      {
        path: 'login', // <-- Add the login route
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