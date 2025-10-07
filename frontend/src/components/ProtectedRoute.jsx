import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check for the token in localStorage
  const token = localStorage.getItem('accessToken');

  // If a token exists, render the child component (e.g., UploadPage).
  // The <Outlet /> component is a placeholder for the child route.
  // If no token, redirect the user to the /login page.
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;