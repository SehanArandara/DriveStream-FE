import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  CreditCard,
  ChevronLeft,
  Car,
  ShieldCheck,
  CheckCircle,
  FileText,
  Wrench,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { initiatePayHerePayment } from '../lib/payhere';

const STATUS_CONFIG = {
  Pending:       { label: 'Awaiting Confirmation', color: 'bg-amber-50 text-amber-600 border border-amber-200' },
  Confirmed:     { label: 'Confirmed',              color: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  'In-Progress': { label: 'In Workshop',            color: 'bg-blue-50 text-blue-600 border border-blue-200' },
  Completed:     { label: 'Completed',              color: 'bg-slate-100 text-slate-600 border border-slate-200' },
  Cancelled:     { label: 'Cancelled',              color: 'bg-rose-50 text-rose-600 border border-rose-200' },
};

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      setBooking(data);
    } catch (err) {
      toast.error('Booking not found');
      navigate('/my-appointments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading Appointment Details...</div>;

  const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG['Pending'];
  const isPaid = booking.paymentStatus === 'Paid';
  const paymentFailed = booking.paymentStatus === 'Failed';

  return (
    <div className="dashboard-content animate-fade max-w-4xl mx-auto">
      <button className="btn-text mb-6 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors" onClick={() => navigate('/my-appointments')}>
        <ChevronLeft size={18}/> Back to Appointments
      </button>

      {/* Payment Failed Banner */}
      {paymentFailed && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-black text-rose-700">Payment Failed</p>
            <p className="text-xs text-rose-500 mt-0.5">Your last payment attempt was unsuccessful. Please try again.</p>
          </div>
          <button
            className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black hover:bg-rose-600 transition-all flex items-center gap-2"
            onClick={() => initiatePayHerePayment(booking._id, () => fetchBooking())}
          >
            <CreditCard size={14} /> RETRY PAYMENT
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-grow">
          <h1 className="text-3xl font-black mb-2">Appointment Details</h1>
          <p className="text-muted">Booked on {new Date(booking.createdAt || booking.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} for {booking.vehicle?.registrationNumber}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Badge */}
          <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
          {/* Payment Badge */}
          {isPaid && (
            <span className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle size={13} /> PAID
            </span>
          )}
          {/* PAY NOW — only when payment is pending and booking is not cancelled/completed */}
          {!isPaid && !paymentFailed && booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
            <button
              className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center gap-2"
              onClick={() => initiatePayHerePayment(booking._id, () => fetchBooking())}
            >
              <CreditCard size={16} /> PAY NOW
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Services List */}
        <div className="card p-0 overflow-hidden">
            <div className="bg-slate-50 p-4 border-b font-bold flex items-center gap-2">
                <FileText size={18} className="text-primary"/> Service Breakdown
            </div>
            <div className="p-6">
                {booking.services.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center py-4 border-b last:border-0">
                        <div>
                            <div className="font-bold">{s.name}</div>
                            <div className="text-xs text-muted flex items-center gap-1"><Clock size={12}/> {s.duration} mins</div>
                        </div>
                        <div className="font-semibold text-slate-700">{s.price.toLocaleString()} LKR</div>
                    </div>
                ))}
            </div>
            <div className="bg-slate-50 p-6 flex justify-between items-center">
                <span className="font-bold text-muted uppercase text-sm">Total Value</span>
                <span className="text-2xl font-black text-success">{booking.totalPrice.toLocaleString()} LKR</span>
            </div>
        </div>

        {/* Right: Info Panels */}
        <div className="flex flex-col gap-6">
            <div className="card p-6">
                <h3 className="mb-4 flex items-center gap-2"><Car size={20} className="text-primary"/> Vehicle Info</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-lg font-bold">{booking.vehicle?.registrationNumber}</div>
                    <div className="text-sm text-muted">{booking.vehicle?.brand} {booking.vehicle?.model}</div>
                    <div className="text-xs mt-1 py-1 px-2 bg-white inline-block rounded border">{booking.vehicle?.category}</div>
                </div>
            </div>

            <div className="card p-6 border-l-4 border-l-success">
                <h3 className="mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-success"/> Booking Policy</h3>
                <p className="text-xs text-muted leading-relaxed">
                    This appointment is verified by our Capacity Engine. Please ensure the vehicle arrives 10 minutes prior to the scheduled session.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
