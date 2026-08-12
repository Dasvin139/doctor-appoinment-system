import { NavLink, useNavigate } from 'react-router-dom';
import { MdDashboard, MdPeople, MdVerified, MdLogout,
         MdCalendarMonth, MdSearch, MdSchedule, MdPerson } from 'react-icons/md';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const customerLinks = [
    { to: '/customer/dashboard',    icon: <MdDashboard />,     label: 'Dashboard' },
    { to: '/customer/doctors',      icon: <MdSearch />,        label: 'Find Doctors' },
    { to: '/customer/appointments', icon: <MdCalendarMonth />, label: 'My Appointments' },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard',    icon: <MdDashboard />,     label: 'Dashboard' },
    { to: '/doctor/slots',        icon: <MdSchedule />,      label: 'Manage Slots' },
    { to: '/doctor/appointments', icon: <MdCalendarMonth />, label: 'Appointments' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { to: '/admin/verify',    icon: <MdVerified />,  label: 'Verify Doctors' },
  ];

  const links =
    user.role === 'customer'    ? customerLinks :
    user.role === 'doctor'      ? doctorLinks   :
    user.role === 'super_admin' ? adminLinks     : [];

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span style={{ fontSize: 24 }}>🏥</span>
        <span>MedBook</span>
      </div>

      {/* User Info */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', marginBottom: 20,
        background: 'var(--surface2)', borderRadius: 'var(--radius-sm)',
      }}>
        <div className="user-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>{initials}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
          <div style={{ fontSize: 11, color: 'var(--primary)', textTransform: 'capitalize' }}>{user.role?.replace('_', ' ')}</div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="nav-item" onClick={logout} style={{ color: 'var(--danger)', width: '100%' }}>
          <MdLogout /> Logout
        </button>
      </div>
    </div>
  );
}
