import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Wrench,
  XCircle
} from 'lucide-react';
import { initiatePayHerePayment } from '../lib/payhere';

const STATUS_CONFIG = {
  Pending:       { label: 'Awaiting Payment', color: 'bg-amber-50 text-amber-600 border-amber-200',      icon: <AlertCircle size={12} /> },
  Confirmed:     { label: 'Confirmed',         color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <CheckCircle2 size={12} /> },
  'In-Progress': { label: 'In Workshop',       color: 'bg-blue-50 text-blue-600 border-blue-200',         icon: <Wrench size={12} /> },
  Completed:     { label: 'Completed',          color: 'bg-slate-100 text-slate-500 border-slate-200',    icon: <CheckCircle2 size={12} /> },
  Cancelled:     { label: 'Cancelled',          color: 'bg-rose-50 text-rose-500 border-rose-200',        icon: <XCircle size={12} /> },
};

const MyAppointments = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading your history...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-slate-500 font-medium mt-1">Track your service status and workshop schedules.</p>
        </div>
        <Link to="/bookings" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform">
          <Calendar size={18} /> New Booking
        </Link>
      </header>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center flex flex-col items-center border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
            <Calendar size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">No history yet</h3>
          <p className="text-slate-500 mt-2 mb-10 leading-relaxed">You haven't scheduled any service appointments at DriveStream yet.</p>
          <button className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20" onClick={() => navigate('/bookings')}>
            Schedule Your First Service
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => {
            const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG['Pending'];
            const isPaid = booking.paymentStatus === 'Paid';
            const isCancelled = booking.status === 'Cancelled';
            const isInProgress = booking.status === 'In-Progress';
            const needsPayment = !isPaid && !isCancelled;

            return (
              <div
                key={booking._id}
                className={`group bg-white p-8 rounded-[2rem] border shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                  isInProgress ? 'border-blue-200 ring-4 ring-blue-50' : 'border-slate-100'
                }`}
              >
                {/* Left — Date + Info */}
                <div className="flex gap-6 flex-1">
                  <div className={`px-5 py-4 rounded-[1.5rem] flex flex-col items-center justify-center min-w-[90px] shadow-lg flex-shrink-0 ${isInProgress ? 'bg-blue-600' : 'bg-slate-900'}`}>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                      {new Date(booking.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-3xl font-black text-white leading-none mt-1">
                      {new Date(booking.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-1">
                    {/* Status Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${statusCfg.color} ${isInProgress ? 'animate-pulse' : ''}`}>
                        {statusCfg.icon} {statusCfg.label}
                      </span>
                      {isPaid && (
                        <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                          <CheckCircle2 size={10} /> PAID
                        </span>
                      )}
                      {needsPayment && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
                          PAYMENT DUE
                        </span>
                      )}
                      <span className="text-sm font-black text-slate-400 font-mono tracking-tighter">
                        {booking.vehicle?.registrationNumber}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {booking.vehicle?.brand} {booking.vehicle?.model}
                    </h3>

                    {/* Service Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {booking.services.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest border border-slate-100">
                          {s.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Clock size={12} className="text-primary" /> {booking.totalDuration} MINS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right — Price + Actions */}
                <div className="flex flex-col items-end gap-3 w-full md:w-auto pt-6 md:pt-0 border-t md:border-0 border-slate-50 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Service Estimate</div>
                    <div className="text-2xl font-black text-slate-900 tabular-nums">
                      {booking.totalPrice.toLocaleString()} <span className="text-xs">LKR</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    {/* PAY NOW — only if payment still pending and not cancelled */}
                    {needsPayment && (
                      <button
                        className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
                        onClick={() => initiatePayHerePayment(booking._id, () => fetchBookings())}
                      >
                        <CreditCard size={14} /> PAY NOW
                      </button>
                    )}

                    {/* DETAILS — always visible except for cancelled */}
                    {!isCancelled && (
                      <button
                        className="flex-1 md:flex-none px-5 py-3 bg-white border-2 border-slate-100 rounded-xl text-xs font-black text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                        onClick={() => navigate(`/my-appointments/${booking._id}`)}
                      >
                        DETAILS <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
