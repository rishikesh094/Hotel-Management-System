import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HotelListing from './pages/HotelListing';
import HotelDetail from './pages/HotelDetail';
import PartnerOnboarding from './pages/PartnerOnboarding';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<HotelListing />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />
            <Route path="/partner" element={<PartnerOnboarding />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/manager/*" element={<ManagerDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
