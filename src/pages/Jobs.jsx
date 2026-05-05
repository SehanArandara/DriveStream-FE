import { useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Clock, 
  Phone,
  User,
  ExternalLink,
  ChevronRight,
  Wrench
} from 'lucide-react';

const STATUS_FLOW = ['Waiting', 'Assigned', 'In-Progress', 'Testing', 'Completed'];

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [finishForm, setFinishForm] = useState({
    technicalRemarks: '',
    partsUsed: [{ name: '', price: '', quantity: 1 }],
    nextServiceDate: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchStaff(); 
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (err) {
      toast.error('Failed to load workshop board');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/staff');
      setStaff(data.filter(s => s.role === 'technician'));
    } catch (err) {
      console.log('Error fetching staff for assignment');
    }
  };

  const startTimer = async (jobId) => {
    try {
      await api.patch(`/jobs/${jobId}/start`);
      toast.success('Timer Started! Vehicle is now in the bay.');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to start service timer');
    }
  };

  const handleAssign = async (jobId, technicianId) => {
    try {
      await api.patch(`/jobs/${jobId}/assign`, { technicianId });
      toast.success('Technician assigned successfully');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to assign technician');
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/jobs/${activeJob._id}/complete`, finishForm);
      toast.success('Job Complete! Invoice has been generated.');
      setShowCompleteModal(false);
      setActiveJob(null);
      fetchJobs();
    } catch (err) {
      toast.error('Error finalizing job');
    }
  };

  const getElapsed = (startTime) => {
    if (!startTime) return '00:00';
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diff = now - start;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Wrench size={40} className="text-primary" />
            Workshop Board
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time tracking of active vehicle services and technician assignments.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm gap-2">
           <div className="px-5 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">New Assignments</span>
              <span className="text-xl font-black text-amber-500">{jobs.filter(j => j.status === 'Assigned').length} <span className="text-xs text-slate-400">JOBS</span></span>
           </div>
           <div className="px-5 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Active Bays</span>
              <span className="text-xl font-black text-primary">{jobs.filter(j => j.status === 'In-Progress').length} <span className="text-xs text-slate-400">UNITS</span></span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center flex flex-col items-center border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                <Wrench size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Queue is empty</h3>
              <p className="text-slate-500 mt-2">Initialize job cards from the Master Schedule to start tracking.</p>
            </div>
          ) : jobs.map(job => (
            <div 
              key={job._id} 
              className={`group relative bg-white p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer flex flex-col md:flex-row justify-between items-center gap-6 ${
                job.status === 'In-Progress' 
                ? 'border-primary ring-4 ring-primary/5 shadow-2xl shadow-primary/10' 
                : 'border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
              } ${activeJob?._id === job._id ? 'border-primary' : ''}`}
              onClick={() => setActiveJob(job)}
            >
              <div className="flex gap-6 items-center flex-1">
                <div className="text-center min-w-[130px] p-4 bg-slate-900 rounded-2xl shadow-lg shadow-slate-200 group-hover:bg-primary transition-colors duration-500">
                  <div className="text-xl font-black tracking-tighter text-white font-mono">{job.vehicle?.registrationNumber}</div>
                  <div className={`mt-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    job.status === 'In-Progress' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white/10 text-slate-400'
                  }`}>
                    {job.status}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">{job.vehicle?.brand} {job.vehicle?.model}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.vehicle?.category} • Job #{job._id.substr(-6).toUpperCase()}</p>
                  
                  {job.status === 'In-Progress' ? (
                    <div className="flex items-center gap-2 text-primary font-black mt-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                      <Clock size={16}/> {getElapsed(job.actualStartTime)}
                    </div>
                  ) : job.technician ? (
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                       <User size={12} className="text-primary"/> Assigned: {job.technician?.name}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto pt-6 md:pt-0 border-t md:border-0 border-slate-50">
                {job.status === 'Waiting' && (
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <select 
                      className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-600 outline-none focus:border-primary transition-all appearance-none"
                      onChange={(e) => handleAssign(job._id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Assign Technician</option>
                      {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                {job.status === 'Assigned' && (
                  <button 
                    className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2" 
                    onClick={(e) => { e.stopPropagation(); startTimer(job._id); }}
                  >
                    <Play size={14} className="fill-current"/> START TIMER
                  </button>
                )}
                {job.status === 'In-Progress' && (
                  <button 
                    className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2" 
                    onClick={(e) => { e.stopPropagation(); setShowCompleteModal(true); }}
                  >
                    <CheckCircle size={14}/> FINISH SERVICE
                  </button>
                )}
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-300">
                   <ChevronRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="xl:col-span-4">
          {activeJob ? (
            <div className="bg-white rounded-[2.5rem] p-8 sticky top-24 border border-slate-100 shadow-sm animate-slide-up">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Job Details</h3>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500">#{activeJob._id.substr(-6).toUpperCase()}</span>
              </div>
              
              <div className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative overflow-hidden group">
                  <User size={64} className="absolute -right-4 -bottom-4 text-slate-200 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 leading-none">Customer Info</div>
                    <div className="flex items-center gap-3 font-black text-slate-900 text-lg mb-1.5"><User size={18} className="text-primary"/> {activeJob.customer?.name}</div>
                    <div className="flex items-center gap-3 text-xs font-black text-slate-500"><Phone size={14} className="text-primary"/> {activeJob.customer?.phone}</div>
                  </div>
                </div>

                {/* Task Checklist */}
                {activeJob.status === 'In-Progress' && activeJob.tasks?.length > 0 && (
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-4 ml-1">Service Checklist</label>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                      {activeJob.tasks.map(task => (
                        <div key={task._id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                          <span className={`text-sm font-black transition-colors ${task.isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task.name}
                          </span>
                          <button 
                            className={`p-2 rounded-lg transition-all ${task.isDone ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400 hover:bg-primary/10 hover:text-primary'}`}
                            onClick={async () => {
                              try {
                                await api.patch(`/jobs/${activeJob._id}/tasks/${task._id}`, { isDone: !task.isDone });
                                toast.success(`Task ${!task.isDone ? 'Completed' : 'Reopened'}`);
                                fetchJobs(); // Refresh to get updated timeline and task status
                                setActiveJob(prev => ({
                                  ...prev, 
                                  tasks: prev.tasks.map(t => t._id === task._id ? { ...t, isDone: !task.isDone } : t),
                                  timeline: [...prev.timeline, { 
                                    status: prev.status, 
                                    note: `Task ${!task.isDone ? 'Completed' : 'Reopened'}: ${task.name}`,
                                    timestamp: new Date().toISOString()
                                  }]
                                }));
                              } catch (err) {
                                toast.error('Failed to update task');
                              }
                            }}
                          >
                            <CheckCircle size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                   <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-4 ml-1">Event Logs</label>
                   <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                      {activeJob.timeline.map((step, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[20px] top-1.5 w-2 h-2 rounded-full border-2 border-white ring-4 transition-all duration-500 ${
                            idx === activeJob.timeline.length - 1 ? 'bg-primary ring-primary/10' : 'bg-slate-300 ring-slate-100'
                          }`}></div>
                          <div>
                            <p className="text-xs font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">{step.status}</p>
                            <p className="text-[10px] text-slate-400 font-bold tabular-nums">
                              {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                   <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2">
                     <ExternalLink size={16}/> VIEW FULL VEHICLE HISTORY
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                <Wrench size={32} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed max-w-[200px]">Select a vehicle to view logs and technical history</p>
            </div>
          )}
        </div>
      </div>

      {showCompleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCompleteModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-900 p-8 text-white">
              <h2 className="text-2xl font-black">Finalize Job Card</h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Verify all service items and generate the final invoice.</p>
            </div>

            <form onSubmit={handleCompleteSubmit} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Technical Remarks (Visible to Customer)</label>
                <textarea 
                  required 
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:border-primary transition-all text-slate-700 font-bold placeholder:text-slate-300" 
                  rows="4" 
                  placeholder="Describe the work performed, replaced parts, and any technical warnings..."
                  onChange={(e) => setFinishForm({...finishForm, technicalRemarks: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Next Service Recommendation</label>
                    <input 
                      type="date" 
                      required 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all font-black"
                      onChange={(e) => setFinishForm({...finishForm, nextServiceDate: e.target.value})}
                    />
                 </div>
                 <div className="flex items-end">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3 w-full">
                       <CheckCircle className="text-emerald-500" size={24}/>
                       <div>
                          <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Auto-Generation</div>
                          <div className="text-xs font-black text-emerald-900">Digital Invoice Pending</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
                <button type="button" className="px-8 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowCompleteModal(false)}>CANCEL</button>
                <button type="submit" className="px-12 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform uppercase tracking-widest">COMPLETE & INVOICE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
