import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { 
  Car, 
  ArrowLeft, 
  Settings, 
  Calendar, 
  Fuel, 
  Zap, 
  Fingerprint, 
  PlusCircle,
  History,
  ShieldCheck
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicle();
    fetchHistory();
  }, [id]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get(`/vehicles/${id}/history`);
      setHistory(data);
    } catch (err) {
      console.log('Error fetching history');
    }
  };

  const fetchVehicle = async () => {
    try {
      const { data } = await api.get(`/vehicles/${id}`);
      setVehicle(data);
    } catch (err) {
      toast.error('Could not load vehicle profile');
      navigate(user?.role === 'customer' ? '/vehicles' : '/admin/vehicles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading Profile...</div>;
  if (!vehicle) return null;

  return (
    <div className="dashboard-content animate-fade">
      <div className="mb-6">
        <button 
          onClick={() => navigate(user?.role === 'customer' ? '/vehicles' : '/admin/vehicles')} 
          className="flex items-center gap-2 text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={18} /> {user?.role === 'customer' ? 'Back to Garage' : 'Back to Directory'}
        </button>
      </div>

      <div className="vehicle-profile-container">
        {/* Main Info Card */}
        <div className="card vehicle-main-card">
          <div className="profile-header">
            <div className="vehicle-avatar">
              <Car size={48} />
            </div>
            <div className="header-text">
              <div className="flex items-center gap-3">
                <h1>{vehicle.brand} {vehicle.model}</h1>
                <span className="badge badge-primary">{vehicle.category}</span>
              </div>
              <p className="text-xl font-bold text-primary mt-1 tracking-widest">{vehicle.registrationNumber}</p>
            </div>
            {user?.role === 'customer' && (
              <div className="header-actions">
                <button className="btn btn-primary" onClick={() => navigate('/bookings')}>
                  <PlusCircle size={18} /> Book Service
                </button>
              </div>
            )}
          </div>

          <div className="details-grid mt-8">
            <div className="detail-box">
              <label><Calendar size={14} /> Manufacture Year</label>
              <p>{vehicle.manufactureYear}</p>
            </div>
            <div className="detail-box">
              <label><Fuel size={14} /> Fuel Type</label>
              <p>{vehicle.fuelType}</p>
            </div>
            <div className="detail-box">
              <label><Zap size={14} /> Engine Capacity</label>
              <p>{vehicle.engineCapacity ? `${vehicle.engineCapacity} CC` : 'Not Specified'}</p>
            </div>
            <div className="detail-box">
              <label><Fingerprint size={14} /> Chassis Number</label>
              <p className="font-mono">{vehicle.chassisNumber || 'Not Specified'}</p>
            </div>
          </div>
        </div>

        {/* Active Service Tracker */}
        {history.some(j => j.status !== 'Completed') && (
          <div className="mt-8 bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Active Workshop Session</h2>
                    <p className="text-blue-100 text-xs font-medium uppercase tracking-widest">In-Workshop Tracking</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-white text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  {history.find(j => j.status !== 'Completed').status}
                </span>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Service Status</div>
                  <div className="space-y-2">
                    {history.find(j => j.status !== 'Completed').tasks?.map((task, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${task.isDone ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                        <span className={`text-xs font-bold ${task.isDone ? 'text-white' : 'text-blue-200'}`}>{task.name}</span>
                        {task.isDone && <ShieldCheck size={14} className="text-emerald-400 ml-auto" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/10">
                  <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-4">Latest Update</div>
                  {history.find(j => j.status !== 'Completed').timeline?.slice(-1).map((step, idx) => (
                    <div key={idx}>
                      <div className="text-sm font-black mb-1">{step.status}</div>
                      <p className="text-xs text-blue-100 leading-relaxed font-medium">"{step.note || 'Technician is working on your vehicle.'}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service History Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History size={20} className="text-slate-400" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Service Logbook</h2>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
              {history.filter(j => j.status === 'Completed').length} Total Records
            </div>
          </div>
          
          {history.filter(j => j.status === 'Completed').length === 0 ? (
            <div className="bg-white rounded-[2.5rem] text-center py-20 border-2 border-dashed border-slate-100 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                <ShieldCheck size={32} />
              </div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">No finalized records found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {history.filter(j => j.status === 'Completed').map((job) => (
                <div key={job._id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex gap-5 items-center">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary font-black text-xl group-hover:bg-primary group-hover:text-white transition-all">
                        {new Date(job.actualEndTime).getDate()}
                      </div>
                      <div>
                        <div className="text-lg font-black text-slate-900 leading-none">
                          {new Date(job.actualEndTime).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                          <Fingerprint size={12} /> JOB #{job.jobNumber || job._id.substr(-6).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-0 md:ml-auto">
                      <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Technician</div>
                        <div className="text-xs font-black text-slate-700 flex items-center gap-1 justify-end">
                           <ShieldCheck size={12} className="text-emerald-500" /> {job.technician?.name || 'Staff Member'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Items</div>
                      <div className="flex flex-wrap gap-2">
                        {job.booking?.services?.map((s, idx) => (
                          <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">
                            {s.name}
                          </span>
                        ))}
                      </div>
                      {job.technicalRemarks && (
                        <div className="mt-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{job.technicalRemarks}"</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-slate-50/30 p-6 rounded-2xl border border-slate-50">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary</span>
                          <span className="text-xs font-black text-emerald-600">PAID</span>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                             <span className="font-bold text-slate-400">Labor & Package</span>
                             <span className="font-black text-slate-700">LKR {job.booking?.totalPrice?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                             <span className="font-bold text-slate-400">Parts Used</span>
                             <span className="font-black text-slate-700">LKR {(job.grandTotal - job.booking?.totalPrice || 0).toLocaleString()}</span>
                          </div>
                          <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between">
                             <span className="text-[10px] font-black text-slate-900 uppercase">Grand Total</span>
                             <span className="text-sm font-black text-primary">LKR {(job.grandTotal || job.booking?.totalPrice).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
