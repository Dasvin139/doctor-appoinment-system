import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar.jsx';
import { getDoctorAppointments } from '../../services/api';
import { MdPeople, MdCalendarMonth, MdPending, MdCheckCircle } from 'react-icons/md';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorAppointments().then(r => { setAppointments(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.slot?.date === today);

  const stats = [
    { label: 'Total Patients',  value: appointments.length, icon: <MdPeople />,        color: '#4D9EFF' },
    { label: 'Today',           value: todayApts.length,    icon: <MdCalendarMonth />,  color: '#845EC2' },
    { label: 'Pending',         value: appointments.filter(a => a.status === 'pending').length, icon: <MdPending />, color: '#FFD93D' },
    { label: 'Completed',       value: appointments.filter(a => a.status === 'completed').length, icon: <MdCheckCircle />, color: '#00C9A7' },
  ];

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="main-content fade-in">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Dr. {user.firstName}'s Dashboard 👨‍⚕️</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Manage your schedule and patients</p>
        </div>

        <div className="grid-4" style={{ marginBottom: 32 }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ color: s.color, background: `${s.color}22` }}>{s.icon}</div>
              <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: 28, background: 'var(--gradient-soft)', border: '1px solid rgba(132,94,194,0.2)' }}>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={() => navigate('/doctor/slots')}>🕐 Manage Slots</button>
            <button className="btn btn-secondary" onClick={() => navigate('/doctor/appointments')}>📅 View Appointments</button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Today's Schedule</h2>
          {loading ? (
            <div className="spinner-wrapper"><div className="spinner" /></div>
          ) : todayApts.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon">🌟</div>
              <h3>No appointments today</h3>
              <p>Add time slots so patients can book you</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/doctor/slots')}>Manage Slots</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todayApts.map(apt => (
                <div key={apt.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(132,94,194,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧑</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{apt.patient?.firstName} {apt.patient?.lastName}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        ⏰ {apt.slot?.startTime?.slice(0,5)} • {apt.visitType === 'clinic' ? '🏥 Clinic' : '🏠 Home'}
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
