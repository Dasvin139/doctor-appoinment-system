import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import { getMyAppointments, updateAppointmentStatus } from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['All', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter]   = useState('All');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMyAppointments().then(r => { setAppointments(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await updateAppointmentStatus(id, { status: 'cancelled', cancellationReason: 'Cancelled by patient' });
      toast.success('Appointment cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    }
  };

  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <h1>My Appointments</h1>
          <p>Track all your bookings in one place</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                border: filter === s ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: filter === s ? 'rgba(0,201,167,0.1)' : 'var(--surface2)',
                color: filter === s ? 'var(--primary)' : 'var(--text-muted)',
              }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">📭</div>
            <h3>No appointments found</h3>
            <p>No {filter !== 'All' ? filter : ''} appointments</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(apt => (
              <div key={apt.id} className="card" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Left avatar */}
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>👨‍⚕️</div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: 16 }}>Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
                        📅 {apt.slot?.date} &nbsp;•&nbsp; ⏰ {apt.slot?.startTime?.slice(0,5)} – {apt.slot?.endTime?.slice(0,5)}
                        &nbsp;•&nbsp; {apt.visitType === 'clinic' ? '🏥 Clinic' : '🏠 Home'}
                      </p>
                    </div>
                    <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                  </div>

                  {apt.reason && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                      📝 Reason: {apt.reason}
                    </p>
                  )}

                  {apt.notesByDoctor && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(0,201,167,0.07)', borderRadius: 8, border: '1px solid rgba(0,201,167,0.15)' }}>
                      <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>DOCTOR'S NOTES</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{apt.notesByDoctor}</p>
                    </div>
                  )}

                  {apt.status === 'pending' && (
                    <button className="btn btn-danger btn-sm" style={{ marginTop: 12 }} onClick={() => cancel(apt.id)}>
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
