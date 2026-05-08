import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get userId from the registration/login redirection state
  const userId = location.state?.userId;
  const phone  = location.state?.phone;

  if (!userId) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Please enter a 6-digit code');
    
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp });
      
      // Save user data and token just like login
      localStorage.setItem('ds_token', data.token);
      localStorage.setItem('ds_user',  JSON.stringify(data.user));
      
      toast.success('Phone verified! Welcome to DriveStream.');
      window.location.href = '/'; // Full refresh to update auth state
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post('/auth/resend-otp', { userId });
      toast.success('A new verification code has been sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card animate-fade">
        <div className="auth-header">
          <div className="flex justify-center" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
            <ShieldCheck size={48} />
          </div>
          <h1>Verify Your Phone</h1>
          <p>We've sent a 6-digit code to <strong>{phone}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Verification Code</label>
            <input 
              type="text" 
              placeholder="000000" 
              maxLength="6"
              required 
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 'bold' }}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-footer">
          Didn't receive a code? <button onClick={handleResend} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>Resend SMS</button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
