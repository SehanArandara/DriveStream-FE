import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Calendar, Download } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 text-center animate-scale-in border border-slate-100">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-200">
          <CheckCircle2 size={48} className="text-white" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Payment Successful!</h1>
        <p className="text-slate-500 font-medium leading-relaxed mb-8">
          Your service booking has been confirmed. We've sent a confirmation to your email.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200/50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</span>
            <span className="text-xs font-black text-slate-900 font-mono">#{orderId?.slice(-8).toUpperCase() || 'DS-PAY-CONFIRMED'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Confirmed</span>
          </div>
        </div>

        <div className="grid gap-4">
          <button 
            onClick={() => navigate('/my-appointments')}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Calendar size={18} /> VIEW APPOINTMENT <ArrowRight size={18} />
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white text-slate-400 border-2 border-slate-100 rounded-2xl font-black hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
