import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Car, Calendar, Wrench, Clock, Plus, ChevronRight, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeJob, setActiveJob] = useState(null);
  const [stats, setStats] = useState({ activeJobs: 0, upcomingBookings: 0, vehicles: 0 });
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time timer logic
  useEffect(() => {
    let timer;
    if (activeJob && activeJob.status === 'In-Progress') {
      timer = setInterval(() => {
        const start = new Date(activeJob.actualStartTime).getTime();
        const now = new Date().getTime();
        const diff = now - start;
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setElapsed(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeJob]);

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, bookingsRes, vRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/bookings/my'),
        api.get('/vehicles')
      ]);

      const jobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];
      const bookings = Array.isArray(bookingsRes.data.bookings) ? bookingsRes.data.bookings : bookingsRes.data;
      const vehicles = Array.isArray(vRes.data.vehicles) ? vRes.data.vehicles : vRes.data;

      setStats({
        activeJobs: jobs.filter(j => j.status !== 'Completed').length,
        upcomingBookings: Array.isArray(bookings) ? bookings.filter(b => b.status === 'Confirmed').length : 0,
        vehicles: Array.isArray(vehicles) ? vehicles.length : 0
      });

      // Find the most recent active job for the tracker
      const live = jobs.find(j => j.status !== 'Completed');
      if (live) setActiveJob(live);

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading DriveStream Dashboard...</div>;

  return (
    <div className="space-y-10 animate-fade">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Welcome, <span className="text-primary">{user?.name.split(' ')[0]}!</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Here's what's happening in your garage today.</p>
        </div>
        <Link to="/bookings" className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
          <Plus size={20} />
          Book a Service
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Wrench size={24} />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 leading-none">{stats.activeJobs}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1.5">Active Jobs</div>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 leading-none">{stats.upcomingBookings}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1.5">Upcoming</div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl">
            <Car size={24} />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 leading-none">{stats.vehicles}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1.5">My Fleet</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Progress Section */}
        <section className="lg:col-span-2 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Live Progress
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Real-time</span>
            </h2>
          </div>
          
          {activeJob ? (
            <div className="space-y-8">
              <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary border border-slate-100">
                  <Car size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900">{activeJob.vehicle?.registrationNumber}</h3>
                  <p className="text-slate-500 font-medium">{activeJob.vehicle?.brand} {activeJob.vehicle?.model}</p>
                </div>
                {activeJob.status === 'In-Progress' && (
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-black text-primary animate-pulse mb-1">Session Active</div>
                    <div className="text-3xl font-black font-mono text-primary tracking-tighter">{elapsed}</div>
                  </div>
                )}
              </div>

              <div className="relative pt-4 pb-8">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
                <div className="flex justify-between relative z-10">
                  {['Waiting', 'Assigned', 'In-Progress', 'Testing', 'Completed'].map((s, i) => {
                    const statuses = ['Waiting', 'Assigned', 'In-Progress', 'Testing', 'Completed'];
                    const currentIndex = statuses.indexOf(activeJob.status);
                    const isDone = i <= currentIndex;
                    const isCurrent = i === currentIndex;

                    return (
                      <div key={s} className="flex flex-col items-center gap-3 group">
                        <div className={`w-5 h-5 rounded-full border-4 transition-all duration-500 ${
                          isDone 
                            ? 'bg-primary border-primary shadow-[0_0_0_4px_rgba(0,106,255,0.15)] scale-125' 
                            : 'bg-white border-slate-200'
                        } ${isCurrent ? 'animate-pulse' : ''}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
                          isDone ? 'text-primary' : 'text-slate-400'
                        }`}>{s}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Clock size={40} />
              </div>
              <p className="font-bold text-slate-400">No active service sessions right now.</p>
              <Link to="/bookings" className="text-primary text-sm font-bold mt-2 hover:underline">Schedule a visit &rarr;</Link>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
          <h2 className="text-2xl font-bold mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link to="/vehicles" className="group p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Car size={24} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg leading-none mb-1">My Garage</div>
                <div className="text-xs text-slate-400 font-medium">Manage {stats.vehicles} vehicles</div>
              </div>
              <ChevronRight size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/invoices" className="group p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CreditCard size={24} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg leading-none mb-1">Payments</div>
                <div className="text-xs text-slate-400 font-medium">History & invoices</div>
              </div>
              <ChevronRight size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/my-appointments" className="group p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Calendar size={24} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg leading-none mb-1">Schedule</div>
                <div className="text-xs text-slate-400 font-medium">View appointments</div>
              </div>
              <ChevronRight size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
