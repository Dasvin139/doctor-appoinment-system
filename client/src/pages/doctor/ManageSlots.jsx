import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import { getMySlots, createSlot, deleteSlot } from '../../services/api';
import toast from 'react-hot-toast';
import { MdAdd, MdDelete } from 'react-icons/md';

export default function ManageSlots() {
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '', visitType: 'clinic' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getMySlots().then(r => { setSlots(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createSlot(form);
      toast.success('Slot created!');
      setForm({ date: '', startTime: '', endTime: '', visitType: 'clinic' });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await deleteSlot(id);
      toast.success('Slot deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete booked slot');
    }
  };

  // Group slots by date
  const grouped = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="main-content fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>Manage Slots</h1>
            <p>Create and manage your available time slots</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <MdAdd /> Add Slot
          </button>
        </div>

        {/* Create Slot Form */}
        {showForm && (
          <div className="card fade-in" style={{ marginBottom: 28, border: '1px solid rgba(0,201,167,0.3)' }}>
            <h3 style={{ marginBottom: 20, fontWeight: 600 }}>New Time Slot</h3>
            <form onSubmit={handleCreate}>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="input" type="date" value={form.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Visit Type</label>
                  <select className="select" value={form.visitType} onChange={e => setForm({...form, visitType: e.target.value})}>
                    <option value="clinic">🏥 Clinic</option>
                    <option value="home">🏠 Home Visit</option>
                    <option value="online">💻 Online</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="input" type="time" value={form.startTime}
                    onChange={e => setForm({...form, startTime: e.target.value + ':00'})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input className="input" type="time" value={form.endTime}
                    onChange={e => setForm({...form, endTime: e.target.value + ':00'})} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Slot'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : slots.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">🕐</div>
            <h3>No slots created yet</h3>
            <p>Create time slots so patients can book appointments with you</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}><MdAdd /> Add First Slot</button>
          </div>
        ) : (
          Object.keys(grouped).sort().map(date => (
            <div key={date} style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 12, color: 'var(--text-muted)', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                📅 {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {grouped[date].map(slot => (
                  <div key={slot.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>⏰ {slot.startTime?.slice(0,5)} – {slot.endTime?.slice(0,5)}</div>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {slot.visitType === 'clinic' ? '🏥' : slot.visitType === 'home' ? '🏠' : '💻'} {slot.visitType}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: slot.isAvailable ? 'var(--primary)' : 'var(--warning)' }}>
                        {slot.isAvailable ? '✅ Available' : '🔒 Booked'}
                      </span>
                      {slot.isAvailable && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(slot.id)}>
                          <MdDelete />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
