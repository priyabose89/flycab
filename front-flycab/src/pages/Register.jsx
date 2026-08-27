import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form.name, form.email, form.phone, form.password);
      navigate('/book');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <h1>Create your FlyCab account</h1>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input value={form.name} onChange={update('name')} required />

        <label>Email</label>
        <input type="email" value={form.email} onChange={update('email')} required />

        <label>Phone</label>
        <input value={form.phone} onChange={update('phone')} />

        <label>Password</label>
        <input type="password" value={form.password} onChange={update('password')} required />

        {error && <p className="error">{error}</p>}

        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}