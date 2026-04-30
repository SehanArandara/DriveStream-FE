import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, Key, Lock, ChevronRight } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    userId: ''
  });

  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: formData.email });
      setFormData({ ...formData, userId: data.userId });
      toast.success('Reset code sent to your phone!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        userId: formData.userId,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card animate-fade">
        <div className="auth-header">
          <h1>{step === 1 ? 'Forgot Password?' : 'Reset Password'}</h1>
          <p>{step === 1 ? 'Enter your email to receive a recovery code' : 'Enter the 6-digit code from your phone'}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestToken} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
              <ChevronRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="auth-form">
            <div className="form-group">
              <label>Reset Code</label>
              <div className="input-with-icon">
                <Key size={18} />
                <input 
                  type="text" 
                  required 
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input 
                  type="password" 
                  required 
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Change Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login" className="flex items-center justify-center gap-2" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
