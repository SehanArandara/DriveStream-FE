import { Bell, Search } from 'lucide-react';

const Navbar = ({ user }) => {
  return (
    <nav className="h-24 bg-white/60 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 px-12 flex items-center justify-end">
      <div className="flex items-center gap-6">
        <div className="flex flex-col text-right">
          <span className="text-sm font-black text-slate-900 leading-none">{user?.name}</span>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1.5">
            {user?.role} Portal
          </span>
        </div>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary font-black shadow-sm overflow-hidden border border-slate-100">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
