import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard'; 
import Loadcell from "./pages/Loadcell";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
       {/* Default route points to your Supervisor Login Page */}
        <Route path="/" element={<Loadcell />} />
        
        {/* Protected floor view dashboard layout */}
       

        {/* Global wildcard fallback: Redirect unmapped URLs back to login */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}