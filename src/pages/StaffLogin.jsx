import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Lock, Mail, Wrench } from 'lucide-react';

const StaffLogin = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      console.log("[Staff Portal] Login success for role:", user.role);
      
      toast.success(`Welcome back, ${user.name}!`);
      
      // Senior SE Note: Hard redirection based on precise role matching
      if (user.role === 'admin' || user.role === 'technician') {
        toast.success(`Welcome back, ${user.name}!`);
        // Redirection logic: Admins to Dashboard, Technicians to Jobs
        const target = user.role === 'admin' ? '/' : '/jobs';
        navigate(target);
      } else {
        toast.error('Access Denied: This portal is for professional staff only.');
        // Redirect customers to their own portal
        navigate('/login');
      }
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page staff-portal">
      <div className="auth-card card animate-fade">
        <div className="auth-header">
          <div className="flex justify-center gap-2" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <ShieldCheck size={32} />
            <Wrench size={32} />
          </div>
          <h1>Staff Portal</h1>
          <p>Internal Operations Login</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Staff Email</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                placeholder="name@drivestream.lk" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--secondary)' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Staff Login'}
          </button>
        </form>

        <p className="auth-footer">
          New employee? <Link to="/setup-staff" style={{ color: 'var(--primary)', fontWeight: 600 }}>Activate Account</Link>
        </p>
      </div>
    </div>
  );
};

export default StaffLogin;
