import { Navigate, Outlet } from 'react-router-dom';

// ProtectedRoute: blocks a page if the user is not logged in
// or does not have the correct role.
// 'role' prop = the required role for this section
export default function ProtectedRoute({ role }) {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');

  // Not logged in → go to login
  if (!token || !user) return <Navigate to="/login" replace />;

  // Wrong role → go to login
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  // All good → render the page
  return <Outlet />;
}
