import { useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import {
  Calendar as CalIcon,
  Car, Plus,
  Wrench,
  Clock,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  Info
} from 'lucide-react';
import { initiatePayHerePayment } from '../lib/payhere';

const Bookings = () => {
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection States
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingDate, setBookingDate] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [capacityInfo, setCapacityInfo] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vId = params.get('vehicleId');
    fetchInitialData(vId);
  }, []);

  const fetchInitialData = async (preselectedId) => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data.vehicles);

      // Auto-select if ID provided in URL
      if (preselectedId) {
        const found = data.vehicles.find(v => v._id === preselectedId);
        if (found) {
          handleVehicleSelect(found);
        }
      }
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load your vehicles');
    }
  };

  const handleVehicleSelect = async (v) => {
    setSelectedVehicle(v);
    setLoading(true);
    try {
      // Senior SE Logic: Fetch contextual services for this specific vehicle category
      const { data } = await api.get(`/services?category=${v.category}`);
      setServices(data);
      setStep(2);
    } catch (err) {
      toast.error('Could not load services for this vehicle type');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (service) => {
    const isSelected = selectedServices.find(s => s._id === service._id);
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s._id !== service._id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const calculateTotals = () => {
    return selectedServices.reduce((acc, s) => {
      const config = s.config.find(c => c.category === selectedVehicle.category);
      return {
        price: acc.price + (config?.priceLKR || 0),
        duration: acc.duration + (config?.durationMinutes || 0)
      };
    }, { price: 0, duration: 0 });
  };

  const checkDateAvailability = async (date) => {
    setBookingDate(date);
    const { duration } = calculateTotals();
    try {
      const { data } = await api.get(`/bookings/check-availability?date=${date}&duration=${duration}`);
      setIsAvailable(data.isAvailable);
      setCapacityInfo(data);
      if (!data.isAvailable) {
        toast.error('Workshop is at full capacity for this date. Please pick another.');
      }
    } catch (err) {
      toast.error('Error checking workshop capacity');
    }
  };

  const handleBookingSubmit = async () => {
    try {
      const payload = {
        vehicleId: selectedVehicle._id,
        serviceIds: selectedServices.map(s => s._id),
        date: bookingDate
      };
      const { data: booking } = await api.post('/bookings', payload);
      
      // Use shared utility
      await initiatePayHerePayment(
        booking._id, 
        () => setStep(4), // onSuccess
        () => (window.location.href = '/my-appointments') // onCancel
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading && step === 1) return <div className="p-20 text-center">Preparing Wizard...</div>;

  const totals = calculateTotals();

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade pb-20">
      {/* Header with Progress Steps */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Book a Service</h1>
          <p className="text-slate-500 font-medium mt-1">Experience seamless maintenance with professional care.</p>
        </div>

        {step < 4 && (
          <div className="flex items-center gap-3 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step === s ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-110' :
                    step > s ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'
                  }`}>
                  {step > s ? <CheckCircle size={20} /> : s}
                </div>
                {s < 3 && <div className="w-6 h-1 bg-slate-100 rounded-full"></div>}
              </div>
            ))}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Selection Area */}
        <div className="lg:col-span-8 space-y-6">

          {/* STEP 1: VEHICLE SELECTION */}
          {step === 1 && (
            <div className="grid gap-4 animate-slide-up">
              <h2 className="text-xl font-bold text-slate-900 ml-2">Select your vehicle</h2>
              {vehicles.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                    <Car size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No vehicles found</h3>
                  <p className="text-slate-500 mt-2 mb-8">Please add a vehicle to your garage to proceed.</p>
                  <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold" onClick={() => (window.location.href = '/vehicles')}>Go to Garage</button>
                </div>
              ) : vehicles.map(v => (
                <div key={v._id}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center cursor-pointer hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all group"
                  onClick={() => handleVehicleSelect(v)}>
                  <div className="flex gap-5 items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Car size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{v.registrationNumber}</h3>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{v.brand} {v.model} • {v.category}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: SERVICE SELECTION */}
          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex items-center justify-between">
                <button className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors" onClick={() => setStep(1)}>
                  <ChevronLeft size={18} /> Back to Vehicle
                </button>
                <h2 className="text-xl font-bold text-slate-900">Choose services</h2>
              </div>

              <div className="grid gap-4">
                {services.map(s => {
                  const sPrice = s.config.find(c => c.category === selectedVehicle.category)?.priceLKR;
                  const sTime = s.config.find(c => c.category === selectedVehicle.category)?.durationMinutes;
                  const isSelected = selectedServices.find(ss => ss._id === s._id);

                  return (
                    <div key={s._id}
                      className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex justify-between items-center group ${isSelected
                          ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5'
                          : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                        }`}
                      onClick={() => toggleService(s)}>
                      <div className="flex-1 pr-6">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-lg font-black text-slate-900 tracking-tight">{s.name}</h4>
                          {isSelected && <CheckCircle size={20} className="text-primary" />}
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">{s.description}</p>
                        <div className="flex gap-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">
                            <Clock size={12} className="text-primary" /> {sTime} mins
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <CreditCard size={12} /> {sPrice?.toLocaleString()} LKR
                          </span>
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 border-slate-200 text-slate-300 group-hover:border-slate-300'
                        }`}>
                        {isSelected ? <CheckCircle size={20} /> : <Plus size={20} />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-8 border-t border-slate-100 flex justify-end">
                <button
                  className="px-12 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black shadow-xl shadow-primary/25 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={selectedServices.length === 0}
                  onClick={() => setStep(3)}
                >
                  Continue to Schedule <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DATE & CONFIRM */}
          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <button className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors" onClick={() => setStep(2)}>
                <ChevronLeft size={18} /> Change Services
              </button>
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <CalIcon size={24} className="text-primary" />
                  Select Date
                </h3>

                <div className="space-y-2 mb-10">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Appointment Date</label>
                  <input
                    type="date"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all text-xl font-bold"
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => checkDateAvailability(e.target.value)}
                  />
                </div>

                {isAvailable !== null && (
                  <div className={`p-6 rounded-3xl mb-10 border-2 transition-all ${isAvailable ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
                    }`}>
                    <div className="flex items-center gap-3 font-black text-lg mb-2">
                      {isAvailable ? <CheckCircle size={24} /> : <Info size={24} />}
                      {isAvailable ? 'Perfect! Time Slot Available' : 'Workshop Fully Booked'}
                    </div>
                    <p className="font-medium opacity-80 leading-relaxed">
                      {isAvailable ?
                        `We have confirmed our team's capacity for your selected duration on this date.` :
                        `Our master schedule is full for this date. Please select an alternative day for your service.`}
                    </p>
                  </div>
                )}

                <button
                  className="w-full py-5 bg-primary hover:bg-primary-hover text-white rounded-[1.5rem] text-xl font-black shadow-2xl shadow-primary/30 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                  disabled={!isAvailable}
                  onClick={handleBookingSubmit}
                >
                  Finalize Booking
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-2xl animate-scale-in flex flex-col items-center">
              <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/30 rotate-3">
                <CheckCircle size={56} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">You're all set!</h1>
              <p className="text-slate-500 font-medium text-lg max-w-md mx-auto mb-12">
                We've successfully reserved your slot. Our expert technicians will be ready for your vehicle on <span className="text-slate-900 font-black underline decoration-primary decoration-4 underline-offset-4">{bookingDate}</span>.
              </p>
              <button
                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
                onClick={() => window.location.href = '/'}
              >
                View in Dashboard
              </button>
            </div>
          )}

        </div>

        {/* SIDEBAR: Summary Panel */}
        {step < 4 && (
          <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 sticky top-24 text-white shadow-2xl shadow-slate-200">
              <h3 className="text-xl font-bold border-b border-white/10 pb-6 mb-8 uppercase tracking-widest text-slate-400">Booking Summary</h3>

              <div className="space-y-8">
                {selectedVehicle && (
                  <div className="animate-fade">
                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest block mb-3">Vehicle Detail</label>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary">
                        <Car size={24} />
                      </div>
                      <div>
                        <div className="font-black text-lg leading-none mb-1">{selectedVehicle.registrationNumber}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase">{selectedVehicle.brand} {selectedVehicle.model}</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedServices.length > 0 && (
                  <div className="animate-fade">
                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest block mb-3">Services ({selectedServices.length})</label>
                    <div className="space-y-2">
                      {selectedServices.map(ss => (
                        <div key={ss._id} className="text-sm font-bold flex items-center gap-2 text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          {ss.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/5 mt-10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                      <Clock size={14} className="text-primary" /> Est. Time
                    </span>
                    <span className="font-black text-lg">{totals.duration} min</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Total Estimate</span>
                    <span className="text-3xl font-black text-emerald-400 tabular-nums">
                      {totals.price.toLocaleString()} <span className="text-sm">LKR</span>
                    </span>
                  </div>
                </div>

                {step === 3 && !bookingDate && (
                  <div className="animate-pulse flex items-start gap-3 text-xs text-amber-400 bg-amber-400/10 p-4 rounded-2xl border border-amber-400/20">
                    <Info size={18} className="shrink-0" />
                    <span className="font-bold leading-relaxed">Please select an appointment date to verify workshop capacity.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
