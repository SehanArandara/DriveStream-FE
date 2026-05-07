import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { Phone, Car, ArrowRight } from 'lucide-react';

const CompleteProfile = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone) return toast.error('Phone number is required');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/complete-profile', { phone });
      toast.success('Verification code sent to your phone!');
      navigate('/verify-otp', { state: { userId: data.userId, phone } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
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
          <h1 className="text-2xl font-bold text-slate-900">One Last Step!</h1>
          <p className="text-slate-500">We need your mobile number to send service updates and technician alerts.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Mobile Number</label>
            <div className="relative flex items-center">
              <Phone size={18} className="absolute left-4 text-slate-400" />
              <input 
                type="tel" 
                placeholder="+94 7X XXX XXXX" 
                required 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium ml-1">
              * A 6-digit verification code will be sent to this number.
            </p>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
            disabled={loading}
          >
            {loading ? 'Sending Code...' : 'Send Verification Code'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-slate-400 hover:text-primary transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
