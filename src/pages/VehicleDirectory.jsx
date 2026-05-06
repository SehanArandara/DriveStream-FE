import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Car, 
  User, 
  ExternalLink, 
  Filter,
  ArrowUpDown,
  Phone,
  Mail
} from 'lucide-react';

const VehicleDirectory = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGlobalDirectory();
  }, []);

  const fetchGlobalDirectory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vehicles/admin/all');
      setVehicles(data.vehicles);
    } catch (err) {
      toast.error('Failed to load global vehicle data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchGlobalDirectory();
    
    setLoading(true);
    try {
      const { data } = await api.get(`/vehicles/search/${searchQuery}`);
      setVehicles(data); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'No matches found');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Car size={40} className="text-primary" />
            Global Directory
          </h1>
          <p className="text-slate-500 font-medium mt-1">Search and manage all registered vehicles across the DriveStream ecosystem.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-5 py-2.5 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Total Fleet</span>
              <span className="text-xl font-black text-slate-900">{vehicles.length} <span className="text-xs text-slate-400">UNITS</span></span>
           </div>
        </div>
      </header>

      {/* Advanced Search Bar */}
      <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm group focus-within:shadow-xl focus-within:-translate-y-1 transition-all duration-500">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative flex items-center">
            <Search size={20} className="absolute left-6 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Plate Number (e.g. WP-CAB-1234)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[1.75rem] outline-none focus:ring-2 focus:ring-primary/10 text-slate-700 font-bold placeholder:text-slate-300 transition-all"
            />
          </div>
          <div className="flex gap-3 px-2">
            <button type="submit" className="px-10 py-5 bg-primary text-white rounded-[1.5rem] font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              FILTER
            </button>
            <button type="button" className="px-8 py-5 bg-white border-2 border-slate-50 text-slate-400 rounded-[1.5rem] font-black hover:bg-slate-50 transition-all" onClick={() => { setSearchQuery(''); fetchGlobalDirectory(); }}>
              RESET
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-primary"></div>
          <p className="mt-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Scanning database...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Registration</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Vehicle Details</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ownership</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Specs</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                        <Search size={32} />
                      </div>
                      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No matching units found</p>
                    </td>
                  </tr>
                ) : vehicles.map((v) => (
                  <tr key={v._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <span className="inline-flex px-3 py-1 bg-slate-900 text-white font-mono font-black tracking-tighter text-sm rounded-lg group-hover:bg-primary transition-colors">
                        {v.registrationNumber}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                          <Car size={20} />
                        </div>
                        <div>
                          <div className="font-black text-slate-900 tracking-tight">{v.brand} {v.model}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{v.manufactureYear} • {v.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 text-sm flex items-center gap-2 tracking-tight">
                          <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center text-[10px] text-primary">{v.owner?.name?.charAt(0)}</div>
                          {v.owner?.name || 'Unknown'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold ml-8">{v.owner?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
                          {v.fuelType}
                        </span>
                        {v.engineCapacity && (
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">
                            {v.engineCapacity} CC
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-[10px] font-black text-slate-400 rounded-xl hover:border-primary hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-widest"
                        onClick={() => navigate(`/vehicles/${v._id}`)}
                      >
                        VIEW PROFILE <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDirectory;
