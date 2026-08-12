import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar.jsx';
import { getAllDoctors } from '../../services/api';
import { MdSearch, MdStar } from 'react-icons/md';

const SPECIALIZATIONS = ['All','Cardiologist','Neurologist','Dermatologist','Pediatrician','Orthopedic','General Physician','Dentist','Ophthalmologist','Psychiatrist','ENT Specialist'];

export default function FindDoctors() {
  const navigate = useNavigate();
  const [doctors,  setDoctors]  = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState('');
  const [spec,     setSpec]     = useState('All');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getAllDoctors().then(r => { setDoctors(r.data.data); setFiltered(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...doctors];
    if (spec !== 'All') list = list.filter(d => d.specialization === spec);
    if (search) list = list.filter(d =>
      `${d.user?.firstName} ${d.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [search, spec, doctors]);

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="main-content fade-in">
        <div className="page-header">
          <h1>Find a Doctor</h1>
          <p>Browse our verified doctors and book an appointment</p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <MdSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 20 }} />
            <input className="input" style={{ paddingLeft: 44 }} placeholder="Search doctor or specialization..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width: 200 }} value={spec} onChange={e => setSpec(e.target.value)}>
            {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Results count */}
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
          {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
        </p>

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No doctors found</h3>
            <p>Try a different search or specialization</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(doc => (
              <div key={doc.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Doctor Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>👨‍⚕️</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Dr. {doc.user?.firstName} {doc.user?.lastName}</div>
                    <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>{doc.specialization}</div>
                  </div>
                </div>

                <hr className="divider" style={{ margin: '4px 0' }} />

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {doc.experienceYears > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                      <MdStar style={{ color: 'var(--warning)' }} />
                      {doc.experienceYears} years experience
                    </div>
                  )}
                  {doc.consultationFee && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      💰 Consultation: <span style={{ color: 'var(--text)', fontWeight: 600 }}>₹{doc.consultationFee}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    🏥 {doc.visitType === 'both' ? 'Clinic & Home visits' : doc.visitType === 'home' ? 'Home visits' : 'Clinic visits'}
                  </div>
                </div>

                {doc.bio && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {doc.bio.length > 80 ? doc.bio.slice(0, 80) + '...' : doc.bio}
                  </p>
                )}

                <button
                  className="btn btn-primary"
                  style={{ marginTop: 'auto', justifyContent: 'center' }}
                  onClick={() => navigate(`/customer/book/${doc.userId}`)}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
