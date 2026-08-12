import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login    from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import CustomerDashboard    from './pages/customer/Dashboard.jsx';
import FindDoctors          from './pages/customer/FindDoctors.jsx';
import BookAppointment      from './pages/customer/BookAppointment.jsx';
import MyAppointments       from './pages/customer/MyAppointments.jsx';

import DoctorDashboard      from './pages/doctor/Dashboard.jsx';
import ManageSlots          from './pages/doctor/ManageSlots.jsx';
import DoctorAppointments   from './pages/doctor/Appointments.jsx';

import AdminDashboard       from './pages/admin/Dashboard.jsx';
import VerifyDoctors        from './pages/admin/VerifyDoctors.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer routes */}
      <Route path="/customer" element={<ProtectedRoute role="customer" />}>
        <Route path="dashboard"    element={<CustomerDashboard />} />
        <Route path="doctors"      element={<FindDoctors />} />
        <Route path="book/:doctorId" element={<BookAppointment />} />
        <Route path="appointments" element={<MyAppointments />} />
      </Route>

      {/* Doctor routes */}
      <Route path="/doctor" element={<ProtectedRoute role="doctor" />}>
        <Route path="dashboard"    element={<DoctorDashboard />} />
        <Route path="slots"        element={<ManageSlots />} />
        <Route path="appointments" element={<DoctorAppointments />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute role="super_admin" />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="verify"    element={<VerifyDoctors />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
