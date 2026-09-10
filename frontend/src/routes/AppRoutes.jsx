import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import Login from '../pages/auth/Login';
import UserRegister from '../pages/auth/UserRegister';
import OrganizerRegister from '../pages/auth/OrganizerRegister';
import VerifyOtp from '../pages/auth/VerifyOtp';

// User Pages
import UserDashboard from '../pages/user/UserDashboard';
import UpcomingEvents from '../pages/user/UpcomingEvents';
import EventDetails from '../pages/user/EventDetails';
import JoinedEvents from '../pages/user/JoinedEvents';
import UserProfile from '../pages/user/UserProfile';

// Organizer Pages
import OrganizerDashboard from '../pages/organizer/OrganizerDashboard';
import MyEvents from '../pages/organizer/MyEvents';
import CreateEvent from '../pages/organizer/CreateEvent';
import EditEvent from '../pages/organizer/EditEvent';
import OrganizerEventDetails from '../pages/organizer/OrganizerEventDetails';
import JoinRequestsPage from '../pages/organizer/JoinRequestsPage';
import CoordinatorsPage from '../pages/organizer/CoordinatorsPage';
import OrganizerProfile from '../pages/organizer/OrganizerProfile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminOrganizers from '../pages/admin/AdminOrganizers';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminEvents from '../pages/admin/AdminEvents';
import AdminProfile from '../pages/admin/AdminProfile';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/user" element={<UserRegister />} />
      <Route path="/register/organizer" element={<OrganizerRegister />} />
      <Route path="/verify-email" element={<VerifyOtp />} />

      {/* USER Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
        <Route
          path="/user/*"
          element={
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="upcoming-events" element={<UpcomingEvents />} />
                <Route path="events/:id" element={<EventDetails />} />
                <Route path="joined-events" element={<JoinedEvents />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          }
        />
      </Route>

      {/* ORGANIZER Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ORGANIZER']} />}>
        <Route
          path="/organizer/*"
          element={
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<OrganizerDashboard />} />
                <Route path="events" element={<MyEvents />} />
                <Route path="create-event" element={<CreateEvent />} />
                <Route path="edit-event/:id" element={<EditEvent />} />
                <Route path="events/:id" element={<OrganizerEventDetails />} />
                <Route path="join-requests" element={<JoinRequestsPage />} />
                <Route path="coordinators" element={<CoordinatorsPage />} />
                <Route path="profile" element={<OrganizerProfile />} />
                <Route path="*" element={<Navigate to="/organizer/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          }
        />
      </Route>

      {/* ADMIN Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route
          path="/admin/*"
          element={
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="organizers" element={<AdminOrganizers />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="edit-event/:id" element={<EditEvent />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          }
        />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
