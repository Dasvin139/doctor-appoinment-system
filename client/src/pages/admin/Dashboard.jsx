import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar.jsx';
import { getAnalytics, getPendingDoctors } from '../../services/api';
import { MdPeople, MdVerified, MdPending, MdCancel } from 'react-icons/md';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [analytics, setAnalytics] = useState(null);
  const [pending,   setPending]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getPendingDoctors()])
      .then(([aRes, pRes]) => { setAnalytics(aRes.data.data); setPending(pRes.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = analytics ? [
    { label: 'Total Patients',  value: analytics.totalCustomers,      icon: <MdPeople />,   color: '#4D9EFF' },
    { label: 'Total Doctors',   value: analytics.totalDoctors,        icon: <MdPeople />,   color: '#845EC2' },
    { label: 'Verified Doctors',value: analytics.verifiedDoctors,     icon: <MdVerified />, color: '#00C9A7' },
    { label: 'Awaiting Review', value: analytics.pendingVerification, icon: <MdPending />,  color: '#FFD93D' },
  ] : [];

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="main-content fade-in">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Admin Dashboard 🛡️</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Platform overview and management</p>
        </div>

        {loading ? <div className="spinner-wrapper"><div className="spinner" /></div> : (
          <>
            <div className="grid-4" style={{ marginBottom: 32 }}>
              {stats.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ color: s.color, background: `${s.color}22` }}>{s.icon}</div>
                  <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
                </div>
              ))}
            </div>

            {/* Pending Verification Alert */}
            {pending.length > 0 && (
              <div className="alert alert-warning" style={{ marginBottom: 24 }}>
                ⚠️ <strong>{pending.length} doctor{pending.length > 1 ? 's' : ''}</strong> waiting for verification.{' '}
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/admin/verify')}>
                  Review now →
                </span>
              </div>
            )}

            {/* Pending Doctors Preview */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>Pending Verifications</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/verify')}>View All</button>
              </div>

              {pending.length === 0 ? (
                <div className="card empty-state">
                  <div className="empty-icon">✅</div>
                  <h3>All caught up!</h3>
                  <p>No doctors pending verification</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pending.slice(0, 3).map(doc => (
                    <div key={doc.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,211,61,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👨‍⚕️</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>Dr. {doc.user?.firstName} {doc.user?.lastName}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{doc.specialization}</div>
                        </div>
                      </div>
                      <span className="badge badge-pending">pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
