import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // For demo purposes, hardcoded simple password. 
    // In production, should check against backend/GAS settings
    if (password === 'admin1234') {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: '50%', marginBottom: '1.5rem' }}>
        <Lock size={32} color="var(--primary)" />
      </div>
      <h2 className="mb-6">เข้าสู่ระบบสำหรับผู้ดูแล</h2>
      
      <form onSubmit={handleLogin}>
        <div className="form-group mb-4">
          <input 
            type="password" 
            className="form-control text-center" 
            placeholder="รหัสผ่านผู้ดูแลระบบ" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        {error && <p className="text-danger mb-4 text-sm">{error}</p>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>เข้าสู่ระบบ</button>
      </form>
    </div>
  );
}

export default AdminLogin;
