import { useNavigate } from 'react-router-dom';
import { XCircle, AlertCircle, RefreshCcw, Home } from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 text-center animate-scale-in border border-slate-100">
        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <XCircle size={48} className="text-rose-500" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Payment Cancelled</h1>
        <p className="text-slate-500 font-medium leading-relaxed mb-8">
          The payment process was interrupted. Don't worry, your appointment request is still saved in your history.
        </p>

        <div className="bg-amber-50 rounded-2xl p-6 mb-8 text-left border border-amber-100 flex gap-4">
          <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
          <p className="text-xs font-bold text-amber-800 leading-relaxed">
            You can retry the payment at any time from the "My Appointments" section in your dashboard.
          </p>
        </div>

        <div className="grid gap-4">
          <button 
            onClick={() => navigate('/my-appointments')}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw size={18} /> RETRY FROM HISTORY
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white text-slate-400 border-2 border-slate-100 rounded-2xl font-black hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} /> BACK TO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
