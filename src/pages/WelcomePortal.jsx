import { Link } from 'react-router-dom';
import { Car, User, ShieldCheck, Wrench, ChevronRight } from 'lucide-react';

const WelcomePortal = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-8">
      <div className="w-full max-w-5xl animate-fade">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-4 text-5xl font-black text-primary mb-4">
            <Car size={60} />
            <span className="tracking-tighter">DriveStream</span>
          </div>
          <p className="text-xl text-slate-500 font-medium">Next-Generation Automotive Service Management</p>
          <p className="text-xl text-slate-500 font-medium">Test CICD - 234</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer Portal Card */}
          <Link to="/login" className="group p-10 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <User size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Customer Portal </h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Book maintenance, track real-time repairs, and manage your vehicle history with ease.
            </p>
            <span className="flex items-center gap-2 text-primary font-bold">
              Enter Customer Portal <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Staff/Admin Portal Card */}
          <Link to="/staff-login" className="group p-10 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
              <Wrench size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Service Professional</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Powerful tools for technicians and admins to manage jobs, inventory, and operations.
            </p>
            <span className="flex items-center gap-2 text-indigo-500 font-bold">
              Staff Secure Login <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        <div className="text-center mt-16 text-slate-400 text-xs font-bold uppercase tracking-widest">
          &copy; 2024 DriveStream Technologies. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default WelcomePortal;
