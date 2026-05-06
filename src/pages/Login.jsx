import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';
import { Car, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  
  const { login, googleLogin } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      handlePostLogin(user);
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        toast.error('Number not verified');
        navigate('/verify-otp', { state: { userId: err.response.data.userId, phone: err.response.data.phone } });
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      handlePostLogin(user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePostLogin = (user) => {
    // Strict Role Check for Customer Portal
    if (user.role === 'customer') {
      toast.success(`Welcome back!`);
      navigate('/dashboard');
    } else {
      toast.error(`Staff detected. Please use the Staff Portal.`);
      navigate('/staff-login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-8">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-xl border border-slate-100 animate-fade">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 text-3xl font-black text-primary mb-2">
            <Car size={32} />
            <span>DriveStream</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Login</h1>
          <p className="text-slate-500">Manage your vehicle services</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 text-slate-400" />
              <input 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-slate-400" />
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" size="sm" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login to Account'}
          </button>
        </form>

        <div className="flex items-center my-8 text-slate-400 text-xs font-bold uppercase tracking-wider before:flex-1 before:border-b before:border-slate-100 after:flex-1 after:border-b after:border-slate-100 before:mr-4 after:ml-4">
          OR
        </div>

        <div className="flex justify-center">
          <GoogleLogin 
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google Registration Failed')}
            theme="filled_blue"
            shape="pill"
            width="100%"
          />
        </div>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Create one for free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
