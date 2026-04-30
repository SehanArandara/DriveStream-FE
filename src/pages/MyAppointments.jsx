import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  CreditCard,
  ChevronRight,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck
} from 'lucide-react';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'badge-success';
      case 'completed': return 'badge-primary';
      case 'pending': return 'badge-secondary';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
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
          <button className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20" onClick={() => window.location.href = '/bookings'}>
            Schedule Your First Service
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex gap-6">
                {/* Date Badge */}
                <div className="bg-slate-900 px-5 py-4 rounded-[1.5rem] flex flex-col items-center justify-center min-w-[90px] shadow-lg shadow-slate-200">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{new Date(booking.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-3xl font-black text-white leading-none mt-1">{new Date(booking.date).getDate()}</span>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status.toLowerCase() === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      booking.status.toLowerCase() === 'completed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        booking.status.toLowerCase() === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                      {booking.status}
                    </span>
                    <span className="text-sm font-black text-slate-400 font-mono tracking-tighter">{booking.vehicle?.registrationNumber}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{booking.vehicle?.brand} {booking.vehicle?.model}</h3>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                      <Tag size={12} className="text-primary" /> {booking.services.length} SERVICES
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                      <Clock size={12} className="text-primary" /> {booking.totalDuration} MINS
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 md:mt-0 flex flex-col items-end gap-5 w-full md:w-auto pt-6 md:pt-0 border-t md:border-0 border-slate-50">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Service Estimate</div>
                  <div className="text-2xl font-black text-slate-900 tabular-nums">
                    {booking.totalPrice.toLocaleString()} <span className="text-xs">LKR</span>
                  </div>
                </div>
                <button
                  className="w-full md:w-auto px-6 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-xs font-black text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                  onClick={() => navigate(`/my-appointments/${booking._id}`)}
                >
                  DETAILS <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
