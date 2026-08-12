import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar.jsx';
import { getDoctorById, getDoctorSlots, bookAppointment } from '../../services/api';
import toast from 'react-hot-toast';
import { MdArrowBack } from 'react-icons/md';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor]   = useState(null);
  const [slots,  setSlots]    = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm]       = useState({ visitType: 'clinic', reason: '', patientAddress: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    Promise.all([
      getDoctorById(doctorId).catch(() => null),
      getDoctorSlots(doctorId),
    ]).then(([docRes, slotsRes]) => {
      if (docRes) setDoctor(docRes.data.data);
      setSlots(slotsRes.data.data);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [doctorId]);

  const filteredSlots = filterDate ? slots.filter(s => s.date === filterDate) : slots;

  const handleBook = async () => {
    if (!selectedSlot) { toast.error('Please select a time slot'); return; }
    if (form.visitType === 'home' && !form.patientAddress) { toast.error('Please enter your address for home visit'); return; }
    setLoading(true);
    try {
      await bookAppointment({ slotId: selectedSlot.id, ...form });
      toast.success('Appointment booked successfully!');
      navigate('/customer/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="page-with-sidebar"><Sidebar />
      <div className="main-content"><div className="spinner-wrapper"><div className="spinner" /></div></div>
    </div>
  );

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="main-content fade-in">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customer/doctors')} style={{ marginBottom: 20 }}>
          <MdArrowBack /> Back to Doctors
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>

          {/* Doctor Info Card */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 70, height: 70, borderRadius: 20, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>👨‍⚕️</div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700 }}>Dr. {doctor?.user?.firstName} {doctor?.user?.lastName}</h2>
                  <p style={{ color: 'var(--primary)', fontWeight: 500 }}>{doctor?.specialization}</p>
                </div>
              </div>
              {doctor?.bio && <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>{doctor.bio}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                {doctor?.experienceYears > 0 && <div style={{ fontSize: 14 }}>⭐ {doctor.experienceYears} years experience</div>}
                {doctor?.consultationFee   && <div style={{ fontSize: 14 }}>💰 ₹{doctor.consultationFee} per visit</div>}
                {doctor?.clinicAddress     && <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>📍 {doctor.clinicAddress}</div>}
              </div>
            </div>

            {/* Visit Type */}
            <div className="card">
              <h3 style={{ marginBottom: 14, fontWeight: 600 }}>Visit Type</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['clinic', 'home'].map(v => (
                  <button key={v} type="button" onClick={() => setForm({...form, visitType: v})}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 8, fontSize: 14,
                      border: form.visitType === v ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: form.visitType === v ? 'rgba(0,201,167,0.1)' : 'var(--surface2)',
                      color: form.visitType === v ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                    }}>
                    {v === 'clinic' ? '🏥 Clinic' : '🏠 Home Visit'}
                  </button>
                ))}
              </div>

              {form.visitType === 'home' && (
                <div className="form-group fade-in">
                  <label className="form-label">Your Address</label>
                  <textarea className="textarea" placeholder="Enter your full address..." style={{ minHeight: 70 }}
                    value={form.patientAddress} onChange={e => setForm({...form, patientAddress: e.target.value})} />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Reason for Visit</label>
                <textarea className="textarea" placeholder="Describe your symptoms..." style={{ minHeight: 80 }}
                  value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Slot Selection */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 600 }}>Select a Time Slot</h3>
              <input type="date" className="input" style={{ width: 170 }}
                value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </div>

            {filteredSlots.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-icon">📅</div>
                <h3>No slots available</h3>
                <p>Try a different date</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                {filteredSlots.map(slot => (
                  <div key={slot.id} onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: '14px 18px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                      border: selectedSlot?.id === slot.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: selectedSlot?.id === slot.id ? 'rgba(0,201,167,0.08)' : 'var(--surface2)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {slot.startTime?.slice(0,5)} – {slot.endTime?.slice(0,5)}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>📅 {slot.date}</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {slot.visitType === 'clinic' ? '🏥' : '🏠'} {slot.visitType}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedSlot && (
              <div style={{ marginTop: 20, padding: '14px', background: 'rgba(0,201,167,0.08)', borderRadius: 10, border: '1px solid rgba(0,201,167,0.2)', fontSize: 14 }}>
                ✅ Selected: <strong>{selectedSlot.date}</strong> at <strong>{selectedSlot.startTime?.slice(0,5)}</strong>
              </div>
            )}

            <button className="btn btn-primary btn-lg" style={{ marginTop: 20 }} onClick={handleBook} disabled={loading || !selectedSlot}>
              {loading ? 'Booking...' : '📅 Confirm Appointment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
