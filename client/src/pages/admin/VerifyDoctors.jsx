import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import { getAdminAllDoctors, verifyDoctor, rejectDoctor } from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'verified', 'rejected'];

export default function VerifyDoctors() {
  const [doctors, setDoctors]       = useState([]);
  const [filter,  setFilter]        = useState('pending');
  const [loading, setLoading]       = useState(true);
  const [rejectModal, setRejectModal] = useState(null); // holds doctor userId
  const [reason, setReason]         = useState('');

  const load = () => {
    setLoading(true);
    getAdminAllDoctors({ status: filter })
      .then(r => { setDoctors(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleVerify = async (userId, name) => {
    try {
      await verifyDoctor(userId);
      toast.success(`Dr. ${name} verified!`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) { toast.error('Please enter a rejection reason'); return; }
    try {
      await rejectDoctor(rejectModal, { reason });
      toast.success('Doctor rejected');
      setRejectModal(null);
      setReason('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <h1>Doctor Verification</h1>
          <p>Review and approve doctor registrations</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                border: filter === s ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: filter === s ? 'rgba(0,201,167,0.1)' : 'var(--surface2)',
                color: filter === s ? 'var(--primary)' : 'var(--text-muted)',
              }}>
              {s === 'pending' ? '⏳' : s === 'verified' ? '✅' : '❌'} {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : doctors.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">{filter === 'pending' ? '✅' : '📭'}</div>
            <h3>{filter === 'pending' ? 'No pending doctors!' : `No ${filter} doctors`}</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {doctors.map(doc => (
              <div key={doc.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>👨‍⚕️</div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: 17 }}>Dr. {doc.user?.firstName} {doc.user?.lastName}</h3>
                      <p style={{ color: 'var(--primary)', fontWeight: 500, fontSize: 14 }}>{doc.specialization}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{doc.user?.email}</p>
                    </div>
                  </div>
                  <span className={`badge badge-${doc.verificationStatus}`}>{doc.verificationStatus}</span>
                </div>

                {/* Details Grid */}
                <div className="grid-3" style={{ marginTop: 16, gap: 12 }}>
                  {[
                    { label: 'Qualification',   val: doc.qualification    || '—' },
                    { label: 'License No.',     val: doc.licenseNumber    || '—' },
                    { label: 'Experience',      val: doc.experienceYears ? `${doc.experienceYears} years` : '—' },
                    { label: 'Consultation Fee',val: doc.consultationFee  ? `₹${doc.consultationFee}` : '—' },
                    { label: 'Visit Type',      val: doc.visitType        || '—' },
                    { label: 'Phone',           val: doc.user?.phone      || '—' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--surface2)', padding: '10px 14px', borderRadius: 8 }}>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{item.label}</p>
                      <p style={{ fontSize: 14, marginTop: 4, fontWeight: 500 }}>{item.val}</p>
                    </div>
                  ))}
                </div>

                {doc.bio && (
                  <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>BIO</p>
                    <p style={{ fontSize: 14 }}>{doc.bio}</p>
                  </div>
                )}

                {doc.rejectionReason && (
                  <div className="alert alert-danger" style={{ marginTop: 14 }}>
                    ❌ Rejection Reason: {doc.rejectionReason}
                  </div>
                )}

                {/* Actions — only for pending */}
                {doc.verificationStatus === 'pending' && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <button className="btn btn-success" onClick={() => handleVerify(doc.userId, `${doc.user?.firstName} ${doc.user?.lastName}`)}>
                      ✅ Verify Doctor
                    </button>
                    <button className="btn btn-danger" onClick={() => { setRejectModal(doc.userId); setReason(''); }}>
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: 480 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Reject Doctor</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                Please provide a reason so the doctor knows what to fix.
              </p>
              <div className="form-group">
                <label className="form-label">Rejection Reason</label>
                <textarea className="textarea" placeholder="e.g. License number is missing or invalid..."
                  value={reason} onChange={e => setReason(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn-danger" onClick={handleReject}>Confirm Reject</button>
                <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
