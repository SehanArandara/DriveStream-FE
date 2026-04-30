import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { Car, Lock, Mail, User, Phone } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      toast.success(data.message);
      navigate('/verify-otp', { state: { userId: data.userId, phone: data.phone } });
    } catch (err) {
      console.error("DEBUG: Registration Error Details:", err);
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      if (user.role === 'customer') {
        toast.success(`Welcome to DriveStream!`);
        navigate('/');
      } else {
        toast.error(`Staff detected. Please use the Staff Portal.`);
        navigate('/staff-login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Registration failed');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500">Join DriveStream to simplify your maintenance</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
            <div className="relative flex items-center">
              <User size={18} className="absolute left-4 text-slate-400" />
              <input 
                name="name"
                type="text" 
                placeholder="John Doe" 
                required 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 text-slate-400" />
              <input 
                name="email"
                type="email" 
                placeholder="name@example.com" 
                required 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
            <div className="relative flex items-center">
              <Phone size={18} className="absolute left-4 text-slate-400" />
              <input 
                name="phone"
                type="tel" 
                placeholder="+94 7X XXX XXXX" 
                required 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-slate-400" />
              <input 
                name="password"
                type="password" 
                placeholder="••••••••" 
                required 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full mt-2 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center my-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest before:flex-1 before:border-b before:border-slate-100 after:flex-1 after:border-b after:border-slate-100 before:mr-4 after:ml-4">
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
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
