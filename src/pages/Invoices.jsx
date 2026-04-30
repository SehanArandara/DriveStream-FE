import { useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Car, 
  CreditCard,
  ExternalLink
} from 'lucide-react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data } = await api.get('/invoices/my');
      setInvoices(data);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Retrieving billing history...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-slate-500 font-medium mt-1">History of all services and parts consumed.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Lifetime Spent</div>
            <div className="text-3xl font-black text-slate-900 tabular-nums">
              {invoices.reduce((sum, i) => sum + i.grandTotal, 0).toLocaleString()} <span className="text-sm">LKR</span>
            </div>
          </div>
        </div>
      </header>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center flex flex-col items-center border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
            <FileText size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">No invoices yet</h3>
          <p className="text-slate-500 mt-2 leading-relaxed">Your billing history will appear here once your first service is completed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {invoices.map((inv) => (
            <div key={inv._id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.25rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{inv.invoiceNumber}</h3>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
                      {new Date(inv.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {inv.vehicle?.registrationNumber}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-10 mt-8 md:mt-0 ml-0 md:ml-auto mr-10">
                  <div>
                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Parts & Labor</div>
                    <div className="font-black text-slate-900">{inv.partsTotal.toLocaleString()} LKR</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 text-right">Total Amount</div>
                    <div className="text-2xl font-black text-emerald-600 tabular-nums">{inv.grandTotal.toLocaleString()} LKR</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-8 md:mt-0 w-full md:w-auto">
                  {inv.isPaid ? (
                    <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-100">
                      <CheckCircle size={14}/> Paid
                    </div>
                  ) : (
                    <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-rose-100 animate-pulse">
                      <AlertCircle size={14}/> Pending
                    </div>
                  )}
                  <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all border border-slate-100">
                    <Download size={20} />
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex justify-between items-center">
                 <div className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                    <Car size={14} className="text-primary"/> {inv.vehicle?.brand} {inv.vehicle?.model}
                 </div>
                 <button 
                  className="inline-flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4" 
                  onClick={() => toast.info('Generating secure PDF...')}
                 >
                    Digital Receipt <ExternalLink size={12}/>
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invoices;
