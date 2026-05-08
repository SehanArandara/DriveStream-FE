import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Play, CheckCircle, Clock, Phone, User, Wrench,
  ChevronRight, History, Calendar, AlertCircle, Car
} from 'lucide-react';
 
const JOB_STATUS_COLOR = {
  Waiting:     'bg-slate-100 text-slate-500',
  Assigned:    'bg-amber-50 text-amber-600 border border-amber-200',
  'In-Progress': 'bg-blue-50 text-blue-600 border border-blue-200 animate-pulse',
  Testing:     'bg-violet-50 text-violet-600 border border-violet-200',
  Completed:   'bg-emerald-50 text-emerald-600 border border-emerald-200',
};
 
const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [tab, setTab] = useState('active'); // 'active' | 'history'
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [finishForm, setFinishForm] = useState({ technicalRemarks: '', nextServiceDate: '' });
  const [elapsed, setElapsed] = useState({});
 
  useEffect(() => { fetchJobs(); fetchStaff(); }, []);
 
  // Live timer for in-progress jobs
  useEffect(() => {
    const timer = setInterval(() => {
      const updates = {};
      jobs.filter(j => j.status === 'In-Progress' && j.actualStartTime).forEach(j => {
        const diff = Date.now() - new Date(j.actualStartTime).getTime();
        const mins = Math.floor(diff / 60000).toString().padStart(2, '0');
        const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        updates[j._id] = `${mins}:${secs}`;
      });
      setElapsed(updates);
    }, 1000);
    return () => clearInterval(timer);
  }, [jobs]);
 
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
      setStaff((data.staff || data).filter(s => s.role === 'technician'));
    } catch (err) { console.log('Staff fetch error'); }
  };
 
  const startTimer = async (jobId, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/jobs/${jobId}/start`);
      toast.success('Timer started! Vehicle is now in the bay.');
      fetchJobs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to start timer'); }
  };
 
  const handleAssign = async (jobId, technicianId) => {
    if (!technicianId) return;
    try {
      await api.patch(`/jobs/${jobId}/assign`, { technicianId });
      toast.success('Technician assigned');
      fetchJobs();
    } catch (err) { toast.error('Failed to assign'); }
  };
 
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/jobs/${activeJob._id}/complete`, finishForm);
      toast.success('Job completed! Invoice generated.');
      setShowCompleteModal(false);
      setActiveJob(null);
      setFinishForm({ technicalRemarks: '', nextServiceDate: '' });
      fetchJobs();
    } catch (err) { toast.error('Error finalizing job'); }
  };
 
  const updateTaskStatus = async (jobId, taskId, status) => {
    try {
      const { data } = await api.patch(`/jobs/${jobId}/tasks/${taskId}`, { status });
      setActiveJob(data);
      fetchJobs();
      toast.success(`Task marked as ${status}`);
    } catch (err) { toast.error('Failed to update task'); }
  };
 
  const activeJobs = jobs.filter(j => j.status !== 'Completed');
  const historyJobs = jobs.filter(j => j.status === 'Completed');
  const displayJobs = tab === 'active' ? activeJobs : historyJobs;
 
  if (loading) return <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest">Loading Workshop...</div>;
 
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Wrench size={36} className="text-primary" /> Workshop Board
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time job tracking and service history.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm gap-2">
          <div className="px-5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Active</span>
            <span className="text-xl font-black text-primary">{activeJobs.length}</span>
          </div>
          <div className="px-5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Completed</span>
            <span className="text-xl font-black text-emerald-500">{historyJobs.length}</span>
          </div>
        </div>
      </header>
 
      {/* Tab Bar */}
      <div className="flex bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm w-fit gap-1">
        {[['active', 'Active Jobs', Wrench], ['history', 'Job History', History]].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setActiveJob(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              tab === key ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
 
      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Job List */}
        <div className="xl:col-span-8 space-y-4">
          {displayJobs.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center flex flex-col items-center border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                {tab === 'active' ? <Wrench size={40} /> : <History size={40} />}
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {tab === 'active' ? 'No active jobs. Assign technicians from Master Schedule.' : 'No completed jobs yet.'}
              </p>
            </div>
          ) : displayJobs.map(job => (
            <div
              key={job._id}
              onClick={() => setActiveJob(job)}
              className={`group bg-white p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer flex flex-col md:flex-row justify-between items-center gap-4 ${
                activeJob?._id === job._id ? 'border-primary ring-4 ring-primary/5 shadow-xl shadow-primary/10' :
                job.status === 'In-Progress' ? 'border-blue-200 shadow-md' : 'border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              <div className="flex gap-5 items-center flex-1">
                {/* Plate Badge */}
                <div className={`text-center min-w-[120px] p-4 rounded-2xl shadow-lg transition-colors duration-500 ${
                  job.status === 'In-Progress' ? 'bg-blue-600' :
                  job.status === 'Completed' ? 'bg-emerald-600' : 'bg-slate-900 group-hover:bg-primary'
                }`}>
                  <div className="text-lg font-black tracking-tighter text-white font-mono">{job.vehicle?.registrationNumber}</div>
                  <div className={`mt-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    job.status === 'In-Progress' ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}>{job.status}</div>
                </div>
 
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${JOB_STATUS_COLOR[job.status] || ''}`}>
                      {job.status}
                    </span>
                    {job.technician && (
                      <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                        <User size={10} className="text-primary" /> {job.technician.name}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-black text-slate-900 leading-none">{job.vehicle?.brand} {job.vehicle?.model}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                    Job #{job.jobNumber || job._id.substr(-6).toUpperCase()} • {job.tasks?.length || 0} Services
                  </p>
 
                  {job.status === 'In-Progress' && (
                    <div className="flex items-center gap-2 text-blue-600 font-black mt-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                      <Clock size={14} /> {elapsed[job._id] || '00:00'}
                    </div>
                  )}
                  {job.status === 'Completed' && job.actualEndTime && (
                    <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                      <CheckCircle size={12} /> Finished: {new Date(job.actualEndTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
 
              {/* Action Buttons */}
              <div className="flex gap-2 w-full md:w-auto" onClick={e => e.stopPropagation()}>
                {job.status === 'Waiting' && user?.role === 'admin' && (
                  <select
                    className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-600 outline-none focus:border-primary appearance-none"
                    onChange={e => handleAssign(job._id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Assign Technician</option>
                    {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                )}
                {job.status === 'Assigned' && (
                  <div className="flex gap-2">
                    <button
                      className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                      onClick={e => startTimer(job._id, e)}
                    >
                      <Play size={13} fill="currentColor" /> START TIMER
                    </button>
                    {user?.role === 'admin' && (
                      <select
                        className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 outline-none focus:border-primary appearance-none hover:bg-white transition-all"
                        onClick={e => e.stopPropagation()}
                        onChange={e => handleAssign(job._id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>REASSIGN</option>
                        {staff.map(s => <option key={s._id} value={s._id}>{s.name.toUpperCase()}</option>)}
                      </select>
                    )}
                  </div>
                )}
                {job.status === 'In-Progress' && (
                  <button
                    className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
                    onClick={e => {
                      e.stopPropagation();
                      // Guard: check if all tasks are done
                      const incomplete = job.tasks?.filter(t => t.status !== 'Completed').length || 0;
                      if (incomplete > 0) {
                        const proceed = window.confirm(`⚠️ ${incomplete} service task(s) are still not completed.\n\nDo you want to finish the job anyway?`);
                        if (!proceed) return;
                      }
                      setActiveJob(job);
                      setShowCompleteModal(true);
                    }}
                  >
                    <CheckCircle size={13} /> FINISH SERVICE
                  </button>
                )}
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-300">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
 
        {/* Detail Panel */}
        <div className="xl:col-span-4">
          {activeJob ? (
            <div className="bg-white rounded-[2.5rem] p-8 sticky top-24 border border-slate-100 shadow-sm space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Job Details</h3>
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${JOB_STATUS_COLOR[activeJob.status] || 'bg-slate-100 text-slate-500'}`}>
                  {activeJob.status}
                </span>
              </div>
 
              {/* Vehicle Info */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Vehicle</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                    <Car size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900">{activeJob.vehicle?.brand} {activeJob.vehicle?.model}</div>
                    <div className="text-xs font-mono font-black text-primary">{activeJob.vehicle?.registrationNumber}</div>
                  </div>
                </div>
              </div>
 
              {/* Customer Info */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Customer</div>
                <div className="font-black text-slate-900 flex items-center gap-2 mb-1"><User size={14} className="text-primary" /> {activeJob.customer?.name}</div>
                <div className="text-xs font-black text-slate-500 flex items-center gap-2"><Phone size={12} className="text-primary" /> {activeJob.customer?.phone}</div>
              </div>
 
              {/* Task Checklist — for active jobs */}
              {(activeJob.status === 'Assigned' || activeJob.status === 'In-Progress') && activeJob.tasks?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Checklist</label>
                    {(() => {
                      const done = activeJob.tasks.filter(t => t.status === 'Completed').length;
                      const total = activeJob.tasks.length;
                      const allDone = done === total;
                      return (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          allDone ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {done}/{total} Done
                        </span>
                      );
                    })()}
                  </div>
                  <div className="space-y-2">
                    {activeJob.tasks.map(task => (
                      <div key={task._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <span className={`text-sm font-black block ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task.name}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            task.status === 'Started' ? 'text-blue-500 animate-pulse' :
                            task.status === 'Completed' ? 'text-emerald-500' : 'text-slate-400'
                          }`}>{task.status || 'Pending'}</span>
                        </div>
                        <div className="flex gap-1.5">
                          {(!task.status || task.status === 'Pending') && (
                            <button onClick={() => updateTaskStatus(activeJob._id, task._id, 'Started')}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center gap-1">
                              <Play size={10} fill="currentColor" /> START
                            </button>
                          )}
                          {task.status === 'Started' && (
                            <button onClick={() => updateTaskStatus(activeJob._id, task._id, 'Completed')}
                              className="px-3 py-1.5 bg-primary text-white rounded-lg text-[9px] font-black hover:bg-emerald-500 transition-all flex items-center gap-1">
                              <CheckCircle size={10} /> DONE
                            </button>
                          )}
                          {task.status === 'Completed' && (
                            <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg"><CheckCircle size={14} /></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
 
              {/* Completed job summary */}
              {activeJob.status === 'Completed' && (
                <div className="space-y-3">
                  {activeJob.technicalRemarks && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Remarks</div>
                      <p className="text-xs text-slate-600 italic leading-relaxed">"{activeJob.technicalRemarks}"</p>
                    </div>
                  )}
                  {activeJob.nextServiceDate && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                      <Calendar size={18} className="text-emerald-600" />
                      <div>
                        <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Next Service Recommended</div>
                        <div className="text-xs font-black text-emerald-900">
                          {new Date(activeJob.nextServiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeJob.partsUsed?.length > 0 && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Parts Used</div>
                      <div className="space-y-1.5">
                        {activeJob.partsUsed.map((p, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-black text-slate-700">
                            <span>{p.name} × {p.quantity}</span>
                            <span className="text-slate-500">LKR {(p.price * p.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Link to vehicle history */}
                  <button
                    className="w-full py-3 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all"
                    onClick={() => navigate(`/vehicles/${activeJob.vehicle?._id}`)}
                  >
                    VIEW VEHICLE HISTORY →
                  </button>
                </div>
              )}
 
              {/* Timeline */}
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Event Log</label>
                <div className="relative pl-5 space-y-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {activeJob.timeline?.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[18px] top-1.5 w-2 h-2 rounded-full border-2 border-white ring-4 ${
                        idx === activeJob.timeline.length - 1 ? 'bg-primary ring-primary/15' : 'bg-slate-300 ring-slate-50'
                      }`} />
                      <p className="text-xs font-black text-slate-800 leading-none mb-0.5">{step.note || step.status}</p>
                      <p className="text-[9px] text-slate-400 font-bold">
                        {new Date(step.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100 flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                <Wrench size={28} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed max-w-[160px]">
                Select a job to view details & logs
              </p>
            </div>
          )}
        </div>
      </div>
 
      {/* Complete Modal — rendered via Portal */}
      {showCompleteModal && activeJob && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setShowCompleteModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-900 p-8 text-white">
              <h2 className="text-2xl font-black">Finalize Job</h2>
              <p className="text-slate-400 text-sm mt-1">Add your remarks and generate the final invoice.</p>
            </div>
 
            <form onSubmit={handleCompleteSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Technical Remarks</label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all font-medium text-slate-700 placeholder:text-slate-300"
                  placeholder="Describe the work performed, any warnings or recommendations..."
                  value={finishForm.technicalRemarks}
                  onChange={e => setFinishForm({ ...finishForm, technicalRemarks: e.target.value })}
                />
              </div>
 
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Next Service Recommendation</label>
                <input
                  type="date"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all font-black"
                  value={finishForm.nextServiceDate}
                  onChange={e => setFinishForm({ ...finishForm, nextServiceDate: e.target.value })}
                />
              </div>
 
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">Invoice will be auto-generated and customer will be notified via SMS.</p>
              </div>
 
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button type="button" className="px-6 py-3 font-black text-slate-400 hover:text-slate-700 transition-colors text-sm" onClick={() => setShowCompleteModal(false)}>CANCEL</button>
                <button type="submit" className="px-10 py-3 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform text-sm uppercase">COMPLETE & INVOICE</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
 
export default Jobs;