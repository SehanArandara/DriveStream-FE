import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { 
  Car, 
  Calendar, 
  Wrench, 
  Clock, 
  Plus, 
  ChevronRight, 
  CreditCard, 
  TrendingUp, 
  Users, 
  CheckCircle,
  AlertCircle,
  Activity,
  ClipboardList,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const { user } = useAuth();
  const [activeJob, setActiveJob] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

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
      const [jobsRes, vRes, invRes, bookingsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/vehicles'),
        api.get('/invoices/my'),
        api.get('/bookings/my')
      ]);

      setAllJobs(jobsRes.data || []);
      setVehicles(vRes.data.vehicles || vRes.data || []);
      setInvoices(invRes.data || []);
      setBookings(bookingsRes.data.bookings || bookingsRes.data || []);

      if (user?.role === 'admin' || user?.role === 'manager') {
        try {
          const { data } = await api.get('/stats/admin');
          setAdminStats(data);
        } catch (e) { console.log("Admin stats fetch failed"); }
      }

      // Role-specific Active Job logic
      let live = null;
      if (user?.role === 'technician') {
        live = jobsRes.data.find(j => j.technician?._id === user._id && j.status === 'In-Progress');
      } else if (user?.role === 'customer') {
        live = jobsRes.data.find(j => j.customer?._id === user._id && j.status !== 'Completed');
      } else {
        live = jobsRes.data.find(j => j.status !== 'Completed' && j.status !== 'Cancelled');
      }
      setActiveJob(live || null);

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Syncing Garage Hub...</div>;

  // RENDER LOGIC
  if (user?.role === 'admin' || user?.role === 'manager') {
    return <AdminDashboard adminStats={adminStats} invoices={invoices} allJobs={allJobs} activeJob={activeJob} elapsed={elapsed} />;
  } else if (user?.role === 'technician') {
    return <TechnicianDashboard allJobs={allJobs} activeJob={activeJob} elapsed={elapsed} user={user} />;
  } else {
    return <CustomerDashboard vehicles={vehicles} bookings={bookings} invoices={invoices} allJobs={allJobs} activeJob={activeJob} elapsed={elapsed} user={user} />;
  }
};

// --- SUB-COMPONENTS FOR BETTER UX ---

const AdminDashboard = ({ adminStats, invoices, allJobs, activeJob, elapsed }) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const last7DaysRevenue = useMemo(() => {
    return invoices
      .filter(inv => new Date(inv.createdAt) >= sevenDaysAgo)
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [invoices]);

  const jobStatusData = useMemo(() => {
    const counts = allJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allJobs]);

  const revenueByCategory = useMemo(() => {
    const categoryMap = {};
    invoices.forEach(inv => {
      inv.booking?.services?.forEach(s => {
        categoryMap[s.name] = (categoryMap[s.name] || 0) + s.price;
      });
    });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [invoices]);

  return (
    <div className="space-y-10 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Garage <span className="text-primary">Intelligence</span></h1>
          <p className="text-slate-500 font-medium mt-1">Management & Operational Command Center.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={<TrendingUp size={24}/>} color="indigo" label="Revenue (7D)" value={`${last7DaysRevenue.toLocaleString()} LKR`} trend="+12%" />
        <StatCard icon={<Calendar size={24}/>} color="amber" label="Pending Requests" value={adminStats?.pendingBookings || 0} />
        <StatCard icon={<Wrench size={24}/>} color="rose" label="Live Workshop" value={adminStats?.activeJobs || 0} />
        <StatCard icon={<Users size={24}/>} color="emerald" label="Staff Online" value={adminStats?.staffCount || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2"><div className="w-1.5 h-6 bg-primary rounded-full"></div> Workshop Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={jobStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {jobStatusData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2"><div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div> Revenue Leaders</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
          <LiveOperations activeJob={activeJob} elapsed={elapsed} />
        </section>
        <div className="space-y-8">
          <QuickLinks admin={true} adminStats={adminStats} />
          <RecentInvoices invoices={invoices} />
        </div>
      </div>
    </div>
  );
};

const TechnicianDashboard = ({ allJobs, activeJob, elapsed, user }) => {
  const myJobs = allJobs.filter(j => j.technician?._id === user._id || j.status === 'Waiting');
  
  return (
    <div className="space-y-10 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tech <span className="text-primary">Portal</span></h1>
          <p className="text-slate-500 font-medium mt-1">Hello {user.name.split(' ')[0]}, here is your service queue.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<ClipboardList size={24}/>} color="blue" label="My Queue" value={myJobs.filter(j => j.status !== 'Completed').length} />
        <StatCard icon={<CheckCircle size={24}/>} color="emerald" label="Completed Today" value={myJobs.filter(j => j.status === 'Completed').length} />
        <StatCard icon={<Activity size={24}/>} color="indigo" label="Current Status" value={activeJob ? 'On Task' : 'Standby'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
          <LiveOperations activeJob={activeJob} elapsed={elapsed} techMode={true} />
        </section>
        <div className="space-y-8">
          <section className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Upcoming Jobs</h2>
            <div className="space-y-4">
              {myJobs.filter(j => j.status === 'Waiting' || j.status === 'Assigned').slice(0, 4).map((job, i) => (
                <Link key={i} to={`/jobs/${job._id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><Car size={18}/></div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-slate-900">{job.vehicle?.registrationNumber}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{job.status}</div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </Link>
              ))}
            </div>
          </section>
          <Link to="/jobs" className="block p-6 bg-primary text-white rounded-[2.5rem] text-center font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Go to Workshop Board</Link>
        </div>
      </div>
    </div>
  );
};

const CustomerDashboard = ({ vehicles, bookings, invoices, allJobs, activeJob, elapsed, user }) => {
  const completedJobs = allJobs.filter(j => j.status === 'Completed').slice(0, 3);

  return (
    <div className="space-y-10 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My <span className="text-primary">Garage</span></h1>
          <p className="text-slate-500 font-medium mt-1">Manage your fleet and track service progress.</p>
        </div>
        <Link to="/bookings" className="px-8 py-4 bg-primary text-white rounded-[2rem] font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
          <Plus size={20} /> New Appointment
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Car size={24}/>} color="indigo" label="My Fleet" value={vehicles.length} />
        <StatCard icon={<Calendar size={24}/>} color="amber" label="Upcoming" value={bookings.filter(b => b.status === 'Confirmed').length} />
        <StatCard icon={<CreditCard size={24}/>} color="emerald" label="Total Spent" value={`${invoices.reduce((s, i) => s + i.grandTotal, 0).toLocaleString()} LKR`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
          <LiveOperations activeJob={activeJob} elapsed={elapsed} />
        </section>
        
        <div className="space-y-8">
          {/* Service History Section */}
          <section className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <History size={20} className="text-primary"/> Recent History
            </h2>
            <div className="space-y-6">
              {completedJobs.length > 0 ? completedJobs.map((job, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-slate-50">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-emerald-500"></div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(job.actualEndTime).toLocaleDateString()}</div>
                  <div className="text-sm font-black text-slate-900 mt-1">{job.vehicle?.registrationNumber}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 line-clamp-1">
                    {job.booking?.services?.map(s => s.name).join(', ') || 'General Service'}
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-400 font-medium italic">No service history yet.</p>
              )}
            </div>
            {completedJobs.length > 0 && (
              <Link to="/invoices" className="block text-center text-[10px] font-black text-primary uppercase tracking-widest mt-8 py-3 bg-indigo-50 rounded-xl hover:bg-primary hover:text-white transition-all">View All History</Link>
            )}
          </section>

          <section className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Vehicle Quick Access</h2>
            <div className="space-y-6">
              {vehicles.slice(0, 3).map((v, i) => {
                const lastJob = allJobs.find(j => j.vehicle?._id === v._id && j.status === 'Completed');
                return (
                  <Link key={i} to={`/vehicles/${v._id}`} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm"><Car size={24}/></div>
                    <div className="flex-1">
                      <div className="text-sm font-black text-slate-900">{v.registrationNumber}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        {lastJob ? `Last Service: ${new Date(lastJob.actualEndTime).toLocaleDateString()}` : `${v.brand} ${v.model}`}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- REUSABLE UI COMPONENTS ---

const StatCard = ({ icon, color, label, value, trend }) => (
  <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all group">
    <div className="flex justify-between items-start">
      <div className={`p-4 bg-${color}-50 text-${color}-600 rounded-2xl group-hover:bg-${color}-600 group-hover:text-white transition-colors`}>{icon}</div>
      {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>}
    </div>
    <div className="mt-6">
      <div className="text-3xl font-black text-slate-900 leading-none tracking-tight">{value}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</div>
    </div>
  </div>
);

const LiveOperations = ({ activeJob, elapsed, techMode }) => (
  <>
    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
    <div className="flex items-center justify-between mb-10 relative z-10">
      <h2 className="text-2xl font-black flex items-center gap-3">
        {techMode ? 'Current Assignment' : 'Live Status'}
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div> Live
        </span>
      </h2>
    </div>
    {activeJob ? (
      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
          <div className="w-20 h-20 bg-primary rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center text-white"><Car size={40} /></div>
          <div className="flex-1">
            <h3 className="text-2xl font-black tracking-tight mb-1">{activeJob.vehicle?.registrationNumber}</h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{activeJob.vehicle?.brand} {activeJob.vehicle?.model}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-black text-primary mb-1">Elapsed</div>
            <div className="text-4xl font-black font-mono text-white tracking-tighter leading-none">{elapsed}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tasks</h4>
            <div className="space-y-3">
              {activeJob.tasks?.map((t, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${t.isDone ? 'bg-emerald-500' : 'bg-white/10'}`}>{t.isDone && <CheckCircle size={12} className="text-white" />}</div>
                  <span className={`text-xs font-bold ${t.isDone ? 'text-white' : 'text-slate-400'}`}>{t.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Timeline</h4>
            <div className="space-y-6">
              {activeJob.timeline?.slice(-3).reverse().map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10'}`}></div>
                    {i !== 2 && <div className="w-0.5 h-full bg-white/5 my-2"></div>}
                  </div>
                  <div>
                    <div className={`text-[10px] font-black uppercase tracking-wider ${i === 0 ? 'text-primary' : 'text-slate-400'}`}>{s.status}</div>
                    <div className="text-xs font-medium text-slate-300 mt-1">{s.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {techMode && (
          <Link to={`/jobs/${activeJob._id}`} className="block w-full py-4 bg-white text-slate-900 rounded-2xl text-center font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Update Progress</Link>
        )}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-24 text-slate-600 relative z-10">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6"><Clock size={48} className="text-slate-700" /></div>
        <p className="font-black uppercase tracking-widest text-xs">System Standby</p>
      </div>
    )}
  </>
);

const QuickLinks = ({ admin, adminStats }) => (
  <section className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
    <h2 className="text-xl font-black text-slate-900 mb-6">Quick Actions</h2>
    <div className="space-y-4">
      {admin ? (
        <>
          <Link to="/jobs" className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Wrench size={20} /></div>
            <div className="flex-1"><div className="text-sm font-black text-slate-900">Workshop Board</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Manage active jobs</div></div>
            <ChevronRight size={16} className="text-slate-300" />
          </Link>
          <Link to="/invoices" className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><CreditCard size={20} /></div>
            <div className="flex-1"><div className="text-sm font-black text-slate-900">Financials</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Billing & Revenue</div></div>
            <ChevronRight size={16} className="text-slate-300" />
          </Link>
        </>
      ) : null}
    </div>
  </section>
);

const RecentInvoices = ({ invoices }) => (
  <section className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
    <h2 className="text-xl font-black text-slate-900 mb-6">Recent Payments</h2>
    <div className="space-y-6">
      {invoices.slice(0, 3).map((inv, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${inv.isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          <div className="flex-1">
            <div className="text-xs font-black text-slate-900 leading-none">{inv.invoiceNumber}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">{inv.customer?.name || 'Customer'}</div>
          </div>
          <div className="text-xs font-black text-slate-900">{inv.grandTotal.toLocaleString()} LKR</div>
        </div>
      ))}
    </div>
    <Link to="/invoices" className="block text-center text-[10px] font-black text-primary uppercase tracking-widest mt-8 py-3 bg-indigo-50 rounded-xl hover:bg-primary hover:text-white transition-all">View All</Link>
  </section>
);

export default Dashboard;
