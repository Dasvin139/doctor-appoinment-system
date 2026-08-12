import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar.jsx';
import { getMyAppointments } from '../../services/api';
import { MdCalendarMonth, MdCheckCircle, MdPending, MdCancel } from 'react-icons/md';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAppointments().then(r => { setAppointments(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Bookings', value: appointments.length, icon: <MdCalendarMonth />, color: '#4D9EFF' },
    { label: 'Pending',  value: appointments.filter(a => a.status === 'pending').length,   icon: <MdPending />,     color: '#FFD93D' },
    { label: 'Completed',value: appointments.filter(a => a.status === 'completed').length, icon: <MdCheckCircle />, color: '#00C9A7' },
    { label: 'Cancelled',value: appointments.filter(a => a.status === 'cancelled').length, icon: <MdCancel />,      color: '#FF6B6B' },
  ];

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="main-content fade-in">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>
            Good morning, {user.firstName}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Here's your health summary</p>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ color: s.color, background: `${s.color}22` }}>{s.icon}</div>
              <div className="stat-info">
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: 28, background: 'var(--gradient-soft)', border: '1px solid rgba(0,201,167,0.2)' }}>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/customer/doctors')}>🔍 Find a Doctor</button>
            <button className="btn btn-secondary" onClick={() => navigate('/customer/appointments')}>📅 My Appointments</button>
          </div>
        </div>

        {/* Recent Appointments */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Recent Appointments</h2>
          {loading ? (
            <div className="spinner-wrapper"><div className="spinner" /></div>
          ) : appointments.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon">📅</div>
              <h3>No appointments yet</h3>
              <p style={{ marginBottom: 16 }}>Book your first appointment with a verified doctor</p>
              <button className="btn btn-primary" onClick={() => navigate('/customer/doctors')}>Find a Doctor</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {appointments.slice(0, 5).map(apt => (
                <div key={apt.id} className="card card-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👨‍⚕️</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {apt.slot?.date} • {apt.slot?.startTime?.slice(0,5)} • {apt.visitType}
                      </div>
                    </div>
                  </div>
                  <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
