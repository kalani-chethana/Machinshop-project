import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard'; // Ensure you saved the dashboard code into src/pages/Dashboard.js

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route points to your Supervisor Login Page */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Protected floor view dashboard layout */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Global wildcard fallback: Redirect unmapped URLs back to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}