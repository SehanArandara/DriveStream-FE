import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Search,
  Play,
  User,
  Car,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Wrench,
  AlertCircle
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedTech, setSelectedTech] = useState('');

  useEffect(() => {
    fetchGlobalBookings();
    fetchTechnicians();
  }, []);

  const fetchGlobalBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my'); // Using /my but handled by Admin logic for all
      console.log("all the data", data)
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load global schedule');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const { data } = await api.get('/staff');
      setTechnicians(data.staff.filter(s => s.role === 'technician' && s.isActive));
    } catch (err) {
      console.log('Error fetching technicians');
    }
  };

  const handleConfirmAndAssign = async (e) => {
    e.preventDefault();
    if (!selectedTech) return toast.error('Please select a technician');

    // Warn admin if assigning to an unpaid booking
    if (selectedBooking?.paymentStatus !== 'Paid') {
      const confirmed = window.confirm(
        '⚠️ This booking has NOT been paid yet.\n\nAre you sure you want to assign a technician? The customer may not complete payment.'
      );
      if (!confirmed) return;
    }

    try {
      await api.post(`/jobs/initialize/${selectedBooking._id}`, { technicianId: selectedTech });
      toast.success('Booking Confirmed & Technician Notified via SMS!');
      setShowAssignModal(false);
      setSelectedBooking(null);
      setSelectedTech('');
      fetchGlobalBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize job');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar size={40} className="text-primary" />
            Master Schedule
          </h1>
          <p className="text-slate-500 font-medium mt-1">Confirm incoming bookings and assign technicians to the workshop floor.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">New Requests</span>
            <span className="text-xl font-black text-primary">{bookings.filter(b => b.status === 'Pending').length} <span className="text-xs text-slate-400">WAITING</span></span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-primary"></div>
          <p className="mt-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing workshop schedule...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Schedule</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Customer & Unit</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Service Package</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                        <Calendar size={32} />
                      </div>
                      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No active service requests</p>
                    </td>
                  </tr>
                ) : bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').map((b) => (
                  <tr key={b._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          {new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{b.totalDuration} Min Session</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-primary font-black text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                          {b.customer?.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 tracking-tight leading-none mb-1.5">{b.customer?.name}</div>
                          <div className="inline-flex px-2 py-0.5 bg-slate-900 text-white font-mono text-[9px] font-black tracking-widest rounded uppercase">
                            {b.vehicle?.registrationNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                        {b.services.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest border border-slate-100">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border text-center ${b.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          b.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                          {b.status}
                        </span>
                        {b.paymentStatus === 'Paid' && (
                          <span className="px-3 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black uppercase tracking-tighter text-center">
                            PAID
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {b.status === 'Pending' || b.status === 'Confirmed' ? (
                        <button
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-[10px] font-black rounded-xl hover:scale-105 shadow-lg shadow-primary/20 transition-all uppercase tracking-widest"
                          onClick={() => { setSelectedBooking(b); setShowAssignModal(true); }}
                        >
                          {b.paymentStatus === 'Paid' ? 'ASSIGN TECH' : 'CONFIRM & ASSIGN'} <ArrowRight size={14} />
                        </button>
                      ) : b.status === 'In-Progress' ? (
                        <div className="flex items-center justify-end gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                          <Wrench size={16} className="animate-pulse" /> IN WORKSHOP
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                          <CheckCircle2 size={16} /> COMPLETED
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation & Assignment Modal — rendered via Portal to escape parent transform */}
      {showAssignModal && selectedBooking && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowAssignModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-900 p-8 text-white">
              <h2 className="text-2xl font-black">Confirm Appointment</h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Review customer details and assign a technician.</p>
            </div>

            <form onSubmit={handleConfirmAndAssign} className="p-8 space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle</span>
                  <span className="font-mono font-black text-slate-900 bg-white px-2 py-1 rounded border border-slate-100">{selectedBooking.vehicle?.registrationNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</span>
                  <span className="font-black text-slate-700">{selectedBooking.vehicle?.brand} {selectedBooking.vehicle?.model}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</span>
                  <span className="font-black text-slate-700">{selectedBooking.customer?.name}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</span>
                  {selectedBooking.paymentStatus === 'Paid' ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 size={10} /> PAID — LKR {selectedBooking.totalPrice?.toLocaleString()}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <AlertCircle size={10} /> UNPAID — PROCEED WITH CAUTION
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assign Service Technician</label>
                <div className="relative">
                  <Wrench size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <select
                    required
                    className="w-full pl-16 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all font-black appearance-none"
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                  >
                    <option value="">Select Available Tech...</option>
                    {technicians.map(t => (
                      <option key={t._id} value={t._id}>{t.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl flex items-center gap-3">
                <Clock size={20} className="text-primary" />
                <p className="text-[10px] font-bold text-primary-hover uppercase tracking-tight">System will automatically send an SMS invitation to the selected technician upon confirmation.</p>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-slate-50">
                <button type="button" className="px-6 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-xs" onClick={() => setShowAssignModal(false)}>CANCEL</button>
                <button type="submit" className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform uppercase tracking-widest text-xs">CONFIRM & NOTIFY TECH</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminBookings;
