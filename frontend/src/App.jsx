import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import SeatAvailability from './pages/SeatAvailability';
import NotFound from './pages/NotFound';

// Student Pages
import UserDashboard from './pages/UserDashboard';
import BookSlot from './pages/BookSlot';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

// Admin & Gate Staff Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageSeats from './pages/ManageSeats';
import ManageSlots from './pages/ManageSlots';
import ManageBookings from './pages/ManageBookings';
import GateScanner from './pages/GateScanner';
import EntryHistory from './pages/EntryHistory';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-sans selection:bg-primary-500/20 selection:text-primary-600 transition-colors duration-150">
            <Navbar />
            <div className="flex-1">
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/seats" element={<SeatAvailability />} />

              {/* Protected Student Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <BookSlot />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* Shared Protected Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Gate Turnstile Operations (Admin & Librarian) */}
              <Route
                path="/gate-scanner"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}>
                    <GateScanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/entry-history"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}>
                    <EntryHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/entry-history"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}>
                    <EntryHistory />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Management Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/seats"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ManageSeats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/slots"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ManageSlots />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ManageBookings />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  </ThemeProvider>
);
}

export default App;
