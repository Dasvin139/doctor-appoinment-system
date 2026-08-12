import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import { getDoctorAppointments, updateAppointmentStatus } from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['All', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter,  setFilter]  = useState('All');
  const [loading, setLoading] = useState(true);
  const [notes,   setNotes]   = useState({});

  const load = () => {
    setLoading(true);
    getDoctorAppointments().then(r => { setAppointments(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status, notesByDoctor) => {
    try {
      await updateAppointmentStatus(id, { status, notesByDoctor });
      toast.success(`Appointment ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <h1>Appointments</h1>
          <p>Manage your patient appointments</p>
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
          <div className="card empty-state">
            <div className="empty-icon">📭</div>
            <h3>No appointments found</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(apt => (
              <div key={apt.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(132,94,194,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🧑</div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: 16 }}>{apt.patient?.firstName} {apt.patient?.lastName}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                        📅 {apt.slot?.date} &nbsp;•&nbsp; ⏰ {apt.slot?.startTime?.slice(0,5)}
                        &nbsp;•&nbsp; {apt.visitType === 'clinic' ? '🏥 Clinic' : '🏠 Home'}
                      </p>
                      {apt.patient?.phone && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>📞 {apt.patient.phone}</p>}
                    </div>
                  </div>
                  <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                </div>

                {apt.reason && (
                  <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>PATIENT'S REASON</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>{apt.reason}</p>
                  </div>
                )}

                {/* Notes box for completing */}
                {apt.status === 'confirmed' && (
                  <div style={{ marginTop: 14 }}>
                    <label className="form-label">Doctor's Notes (for completion)</label>
                    <textarea className="textarea" style={{ minHeight: 70, marginTop: 6 }}
                      placeholder="Write diagnosis, prescription, follow-up instructions..."
                      value={notes[apt.id] || ''}
                      onChange={e => setNotes({ ...notes, [apt.id]: e.target.value })}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  {apt.status === 'pending' && <>
                    <button className="btn btn-success btn-sm" onClick={() => updateStatus(apt.id, 'confirmed')}>✅ Confirm</button>
                    <button className="btn btn-danger btn-sm"  onClick={() => updateStatus(apt.id, 'cancelled')}>❌ Cancel</button>
                  </>}
                  {apt.status === 'confirmed' && (
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(apt.id, 'completed', notes[apt.id])}>
                      🏁 Mark Completed
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
