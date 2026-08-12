import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import toast from 'react-hot-toast';
import { MdEmail, MdLock, MdArrowForward } from 'react-icons/md';

export default function Login() {
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Welcome back, ${user.firstName}!`);
      // Redirect based on role
      if (user.role === 'customer')    navigate('/customer/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else                             navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-logo">🏥</div>
        <h1>MedBook</h1>
        <p>Your trusted platform to connect patients with the best doctors near you.</p>
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['🔒 Secure & Private', '⚡ Instant Booking', '👨‍⚕️ Verified Doctors'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-box fade-in">
          <h2>Welcome back 👋</h2>
          <p>Sign in to your account to continue</p>

          {/* Role Selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {[
              { val: 'customer',    label: '🧑 Patient' },
              { val: 'doctor',      label: '👨‍⚕️ Doctor' },
              { val: 'super_admin', label: '🛡️ Admin' },
            ].map(r => (
              <button
                key={r.val}
                type="button"
                onClick={() => setForm({ ...form, role: r.val })}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  border: form.role === r.val ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: form.role === r.val ? 'rgba(0,201,167,0.1)' : 'var(--surface2)',
                  color: form.role === r.val ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <MdEmail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                <input className="input" style={{ paddingLeft: 42 }} name="email" type="email"
                  placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                <input className="input" style={{ paddingLeft: 42 }} name="password" type="password"
                  placeholder="••••••••" value={form.password} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Signing in...' : <> Sign In <MdArrowForward /> </>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
