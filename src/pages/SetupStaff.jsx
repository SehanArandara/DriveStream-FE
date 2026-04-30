import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Key, Mail, Lock } from 'lucide-react';

const SetupStaff = () => {
  const [formData, setFormData] = useState({
    email: '',
    setupToken: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/setup-staff-password', {
        email: formData.email,
        setupToken: formData.setupToken,
        newPassword: formData.newPassword
      });
      toast.success(data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card animate-fade">
        <div className="auth-header">
          <div className="flex justify-center" style={{ color: 'var(--success)', marginBottom: '1rem' }}>
            <ShieldAlert size={48} />
          </div>
          <h1>Staff Setup</h1>
          <p>Complete your account activation</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Work Email</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                placeholder="name@drivestream.lk" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Setup Token (from SMS)</label>
            <div className="input-with-icon">
              <Key size={18} />
              <input 
                type="text" 
                placeholder="TOKEN" 
                required 
                value={formData.setupToken}
                onChange={(e) => setFormData({...formData, setupToken: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Choose Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Setting up...' : 'Complete Activation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupStaff;
