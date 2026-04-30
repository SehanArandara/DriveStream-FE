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
  FileText
} from 'lucide-react';

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

  return (
    <div className="dashboard-content animate-fade max-w-4xl mx-auto">
      <button className="btn-text mb-6" onClick={() => navigate('/my-appointments')}>
        <ChevronLeft size={18}/> Back to Appointments
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-grow">
          <h1 className="text-3xl font-black mb-2">Appointment Details</h1>
          <p className="text-muted">Reserved on {new Date(booking.date).toLocaleDateString()} for {booking.vehicle?.registrationNumber}</p>
        </div>
        <div className="flex items-center">
            <span className={`badge ${booking.status === 'Confirmed' ? 'badge-success' : 'badge-primary'} p-4 text-lg px-8`}>
                {booking.status}
            </span>
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
