import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import toast from 'react-hot-toast';
import { MdArrowForward } from 'react-icons/md';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'customer', specialization: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo">🏥</div>
        <h1>Join MedBook</h1>
        <p>Create your account and get access to top-rated, verified doctors instantly.</p>
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['✅ Free to sign up', '🏥 100+ Verified Doctors', '📅 Easy Scheduling'].map(f => (
            <div key={f} style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>{f}</div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box fade-in">
          <h2>Create Account</h2>
          <p>Fill in your details to get started</p>

          {/* Role Selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[{ val: 'customer', label: '🧑 Patient' }, { val: 'doctor', label: '👨‍⚕️ Doctor' }].map(r => (
              <button key={r.val} type="button" onClick={() => setForm({ ...form, role: r.val })}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  border: form.role === r.val ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: form.role === r.val ? 'rgba(0,201,167,0.1)' : 'var(--surface2)',
                  color: form.role === r.val ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="input" name="firstName" placeholder="Ravi" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="input" name="lastName" placeholder="Kumar" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
            </div>

            {form.role === 'doctor' && (
              <div className="form-group fade-in">
                <label className="form-label">Specialization</label>
                <select className="select" name="specialization" value={form.specialization} onChange={handleChange} required>
                  <option value="">Select Specialization</option>
                  {['Cardiologist','Neurologist','Dermatologist','Pediatrician','Orthopedic','General Physician','Dentist','Ophthalmologist','Psychiatrist','ENT Specialist'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>⚠️ Your profile will be verified by admin before you can see patients.</p>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Creating account...' : <> Create Account <MdArrowForward /> </>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
