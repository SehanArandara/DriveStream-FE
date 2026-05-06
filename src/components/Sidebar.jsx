import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Car, Wrench, Receipt, LogOut, Users, Search, Settings, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const role = user?.role || 'customer';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['customer', 'technician', 'admin'] },
    { name: 'My Garage', path: '/vehicles', icon: <Car size={18} />, roles: ['customer'] },
    { name: 'Appointments', path: '/my-appointments', icon: <Calendar size={18} />, roles: ['customer'] },
    { name: 'Book Service', path: '/bookings', icon: <Wrench size={18} />, roles: ['customer'] },
    { name: 'Billing', path: '/invoices', icon: <CreditCard size={18} />, roles: ['customer', 'admin'] },
    { name: 'Directory', path: '/admin/vehicles', icon: <Search size={18} />, roles: ['admin', 'technician'] },
    { name: 'Manage Bookings', path: '/admin/bookings', icon: <Calendar size={18} />, roles: ['admin'] },
    { name: 'Jobs', path: '/jobs', icon: <Wrench size={18} />, roles: ['admin', 'technician'] },
    { name: 'Staff', path: '/staff', icon: <Users size={18} />, roles: ['admin'] },
    { name: 'Settings', path: '/admin/catalog', icon: <Settings size={18} />, roles: ['admin'] },
  ].filter(item => item.roles.includes(role));

  return (
    <aside className="fixed left-0 top-0 w-[280px] h-screen bg-slate-900 flex flex-col p-8 z-50 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none opacity-50"></div>
      
      <div className="relative z-10 flex items-center gap-3 text-2xl font-black text-white mb-12 ml-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/40">
          <Car size={24} className="text-white" />
        </div>
        <span className="tracking-tighter">Drive<span className="text-primary">Stream</span></span>
      </div>
      
      <nav className="relative z-10 flex flex-col gap-2 flex-1 overflow-y-auto pr-2 -mr-4 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `
              flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all duration-300 group
              ${isActive 
                ? 'bg-primary text-white shadow-xl shadow-primary/30 translate-x-2' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            {({ isActive }) => (
              <>
                <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-xs uppercase tracking-widest">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="relative z-10 mt-auto pt-8 border-t border-white/5">
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
