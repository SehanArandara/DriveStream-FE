import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import {
  Car,
  Plus,
  Trash2,
  Edit3,
  Info,
  Calendar,
  Fuel,
  Zap,
  Disc,
  ArrowRight
} from 'lucide-react';

const BRANDS = ['Toyota', 'Honda', 'Suzuki', 'Nissan', 'Mitsubishi', 'BMW', 'Mercedes', 'Other'];
const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];

const Vehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]); // Dynamic categories
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    registrationNumber: '',
    category: '',
    brand: 'Toyota',
    model: '',
    manufactureYear: new Date().getFullYear(),
    fuelType: 'Petrol',
    engineCapacity: '',
    chassisNumber: ''
  });

  useEffect(() => {
    fetchVehicles();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/vehicle-types');
      setCategories(data);
      if (data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: data[0].name }));
      }
    } catch (err) {
      toast.error('Failed to load vehicle types');
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data.vehicles);
    } catch (err) {
      toast.error('Failed to load your garage');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Senior SE: Process and sanitize data types
    const processedData = {
      ...formData,
      registrationNumber: formData.registrationNumber.toUpperCase().trim(),
      manufactureYear: parseInt(formData.manufactureYear),
      engineCapacity: formData.engineCapacity ? parseInt(formData.engineCapacity) : undefined,
      chassisNumber: formData.chassisNumber?.trim() || undefined
    };

    console.log("[Vehicles] Sending data:", processedData);

    try {
      if (editingId) {
        await api.put(`/vehicles/${editingId}`, processedData);
        toast.success('Vehicle updated successfully');
      } else {
        await api.post('/vehicles', processedData);
        toast.success('Vehicle added to your garage!');
      }
      setShowModal(false);
      resetForm();
      fetchVehicles();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, plate) => {
    if (window.confirm(`Are you sure you want to remove ${plate} from your garage?`)) {
      try {
        await api.delete(`/vehicles/${id}`);
        toast.success('Vehicle removed');
        fetchVehicles();
      } catch (err) {
        toast.error('Failed to remove vehicle');
      }
    }
  };

  const openEdit = (v) => {
    setFormData({
      registrationNumber: v.registrationNumber,
      category: v.category,
      brand: v.brand,
      model: v.model,
      manufactureYear: v.manufactureYear,
      fuelType: v.fuelType,
      engineCapacity: v.engineCapacity || '',
      chassisNumber: v.chassisNumber || ''
    });
    setEditingId(v._id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      registrationNumber: '',
      category: categories[0]?.name || '', // Use first dynamic category
      brand: 'Toyota',
      model: '',
      manufactureYear: new Date().getFullYear(),
      fuelType: 'Petrol',
      engineCapacity: '',
      chassisNumber: ''
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-10 animate-fade pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Car size={40} className="text-primary" />
            My Garage
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage your vehicles for effortless service bookings.</p>
        </div>
        <button 
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <Plus size={20} /> Add New Vehicle
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-primary"></div>
          <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Opening Garage doors...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center flex flex-col items-center border border-slate-100 shadow-sm">
          <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
            <Car size={80} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Your garage is empty</h3>
          <p className="text-slate-500 max-w-xs mt-2 mb-10 leading-relaxed">Add your first vehicle to start booking services and tracking maintenance.</p>
          <button 
            className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform" 
            onClick={() => setShowModal(true)}
          >
            Add Your Car Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {vehicles.map((v) => (
            <div key={v._id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col">
              <div 
                className="relative h-44 bg-slate-900 p-8 flex flex-col justify-end cursor-pointer overflow-hidden"
                onClick={() => navigate(`/vehicles/${v._id}`)}
              >
                {/* Decorative background icon */}
                <Car size={160} className="absolute -right-10 -top-10 text-white/5 rotate-12 transition-transform group-hover:rotate-6 group-hover:scale-110 duration-700" />
                
                <div className="relative z-10">
                  <div className="inline-flex px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-white font-mono font-bold tracking-widest text-xs mb-2 border border-white/20 uppercase">
                    {v.registrationNumber}
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1">{v.brand} {v.model}</h3>
                  <div className="flex items-center gap-3 text-white/60 text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {v.manufactureYear}</span>
                    <span className="flex items-center gap-1"><Fuel size={12} /> {v.fuelType}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-6">
                  {v.engineCapacity && (
                    <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Zap size={10} /> {v.engineCapacity} CC
                    </span>
                  )}
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Disc size={10} /> {v.category}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-1">
                    <button 
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center" 
                      onClick={(e) => { e.stopPropagation(); openEdit(v); }}
                      title="Edit Vehicle"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center" 
                      onClick={(e) => { e.stopPropagation(); handleDelete(v._id, v.registrationNumber); }}
                      title="Remove Vehicle"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <button 
                    className="inline-flex items-center gap-2 text-primary font-black text-sm group/btn"
                    onClick={() => navigate(`/bookings?vehicleId=${v._id}`)}
                  >
                    BOOK SERVICE 
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-900 p-8 text-white">
              <h2 className="text-2xl font-black">{editingId ? 'Update Vehicle' : 'Register Vehicle'}</h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Please provide accurate vehicle specifications.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Reg Number</label>
                  <input
                    required
                    placeholder="e.g. WP CAB-1234"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary transition-all font-mono font-bold"
                    value={formData.registrationNumber}
                    onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                    disabled={!!editingId}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary transition-all font-bold appearance-none"
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary transition-all font-bold"
                    value={formData.brand} 
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  >
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Model Name</label>
                  <input 
                    required 
                    placeholder="e.g. Corolla" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary transition-all font-bold"
                    value={formData.model} 
                    onChange={e => setFormData({ ...formData, model: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary transition-all font-bold"
                    value={formData.manufactureYear} 
                    onChange={e => setFormData({ ...formData, manufactureYear: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fuel</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary transition-all font-bold"
                    value={formData.fuelType} 
                    onChange={e => setFormData({ ...formData, fuelType: e.target.value })}
                  >
                    {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Engine Capacity (CC) - <span className="text-slate-300">Optional</span></label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1500" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary transition-all font-bold"
                    value={formData.engineCapacity} 
                    onChange={e => setFormData({ ...formData, engineCapacity: e.target.value })} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 mt-10">
                <button 
                  type="button" 
                  className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-10 py-3.5 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  {editingId ? 'Save Updates' : 'Add to Garage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
