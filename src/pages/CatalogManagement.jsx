import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { 
  Settings, 
  Package, 
  Truck, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  XCircle,
  Clock,
  DollarSign
} from 'lucide-react';

const CatalogManagement = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // States for the creation forms
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    applicableCategories: [],
    config: [],
    isAvailable: true
  });

  const [typeForm, setTypeForm] = useState({
    name: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, tRes] = await Promise.all([
        api.get('/services'),
        api.get('/vehicle-types')
      ]);
      setServices(sRes.data);
      setVehicleTypes(tRes.data);
    } catch (err) {
      toast.error('Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = async (id) => {
    try {
      await api.patch(`/services/${id}/toggle`);
      toast.success('Service status updated');
      fetchData();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/services/${editingItem._id}`, serviceForm);
        toast.success('Service updated');
      } else {
        await api.post('/services', serviceForm);
        toast.success('Service added to catalog');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving service');
    }
  };

  // Logic for the Dynamic Service Config (LKR & Minutes per Category)
  const handleConfigChange = (category, field, value) => {
    const existingIndex = serviceForm.config.findIndex(c => c.category === category);
    let newConfig = [...serviceForm.config];

    if (existingIndex > -1) {
      newConfig[existingIndex] = { ...newConfig[existingIndex], [field]: Number(value) };
    } else {
      newConfig.push({ category, [field]: Number(value) });
    }

    setServiceForm({ ...serviceForm, config: newConfig });
  };

  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/vehicle-types/${editingItem._id}`, typeForm);
        toast.success('Vehicle type updated');
      } else {
        await api.post('/vehicle-types', typeForm);
        toast.success('New category added');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  const handleToggleType = async (id) => {
    try {
      await api.patch(`/vehicle-types/${id}/toggle`);
      toast.success('Category status updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const openTypeEdit = (type) => {
    setEditingItem(type);
    setTypeForm({ name: type.name, description: type.description, isActive: type.isActive });
    setShowModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Settings size={40} className="text-primary" />
            Catalog & Pricing
          </h1>
          <p className="text-slate-500 font-medium mt-1">Configure service definitions, workshop durations, and multi-category LKR pricing.</p>
        </div>
        <button 
          className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest text-xs"
          onClick={() => { 
            setEditingItem(null); 
            setServiceForm({ name: '', description: '', applicableCategories: [], config: [], isAvailable: true });
            setTypeForm({ name: '', description: '', isActive: true });
            setShowModal(true); 
          }}
        >
          <Plus size={18} /> {activeTab === 'services' ? 'Add Service' : 'Add Category'}
        </button>
      </header>

      {/* Modern Tabs */}
      <div className="flex bg-white p-1.5 rounded-3xl border border-slate-100 shadow-sm w-fit">
        <button 
          className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black transition-all text-xs tracking-widest uppercase ${
            activeTab === 'services' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-400 hover:text-slate-600'
          }`}
          onClick={() => setActiveTab('services')}
        >
          <Package size={18} /> Service Catalog
        </button>
        <button 
          className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black transition-all text-xs tracking-widest uppercase ${
            activeTab === 'types' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-400 hover:text-slate-600'
          }`}
          onClick={() => setActiveTab('types')}
        >
          <Truck size={18} /> Vehicle Categories
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
           <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-primary mb-4"></div>
           <span className="text-[10px] font-black uppercase tracking-widest">Loading Master Catalog...</span>
        </div>
      ) : activeTab === 'services' ? (
        <div className="grid gap-6">
          {services.map(service => (
            <div key={service._id} className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
              <div className="flex-grow">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{service.name}</h3>
                  {!service.isAvailable && (
                    <span className="px-3 py-1 bg-rose-50 text-rose-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-rose-100">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">{service.description}</p>
                <div className="flex flex-wrap gap-3 mt-6">
                  {service.config.map(c => (
                    <div key={c.category} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[10px] font-black text-primary shadow-sm border border-slate-100 uppercase">
                        {c.category.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.category}</div>
                        <div className="text-xs font-black text-slate-700 tabular-nums">
                          {c.durationMinutes}m • <span className="text-emerald-600">{c.priceLKR.toLocaleString()} LKR</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 w-full xl:w-auto pt-6 xl:pt-0 border-t xl:border-0 border-slate-50">
                <button 
                  className="flex-1 xl:flex-none p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all group/btn" 
                  onClick={() => { setEditingItem(service); setServiceForm(service); setShowModal(true); }}
                >
                  <Edit3 size={20} className="group-hover/btn:scale-110 transition-transform" />
                </button>
                <button 
                  className={`flex-1 xl:flex-none px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    service.isAvailable 
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                  }`}
                  onClick={() => handleToggleService(service._id)}
                >
                  {service.isAvailable ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category Name</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Internal Description</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Availability</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehicleTypes.map(type => (
                  <tr key={type._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs uppercase group-hover:bg-primary transition-colors">
                          {type.name.charAt(0)}
                        </div>
                        <span className="font-black text-slate-900 tracking-tight">{type.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-500">{type.description}</td>
                    <td className="px-8 py-6">
                      {type.isActive ? 
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                          <CheckCircle size={14}/> ACTIVE
                        </span> : 
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100">
                          <XCircle size={14}/> SUSPENDED
                        </span>
                      }
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary/5 hover:text-primary transition-all" onClick={() => openTypeEdit(type)}>
                          <Edit3 size={16}/>
                        </button>
                        <button 
                          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            type.isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                          }`}
                          onClick={() => handleToggleType(type._id)}
                        >
                          {type.isActive ? 'Suspend' : 'Reinstate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS — Using Portal to ensure it renders at the root of the body and ignores parent animation/transform constraints */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop with Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-fade-in" 
            onClick={() => setShowModal(false)} 
          />

          {/* Modal container */}
          <div className={`relative w-full bg-white rounded-[2.5rem] shadow-2xl flex flex-col animate-scale-in overflow-hidden ${activeTab === 'services' ? 'max-w-4xl' : 'max-w-lg'} max-h-[90vh]`}>

            {/* Sticky dark header */}
            <div className="bg-slate-900 p-8 text-white flex-shrink-0 relative">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{editingItem ? 'Update' : 'Create'} {activeTab === 'services' ? 'Service Item' : 'Category'}</h2>
                  <p className="text-slate-400 text-sm mt-1 font-medium italic">Master Catalog Configuration</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <XCircle size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {activeTab === 'services' ? (
                <form onSubmit={handleServiceSubmit} className="p-8 md:p-10 space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Service Designation</label>
                        <input
                          required
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800"
                          value={serviceForm.name}
                          onChange={e => setServiceForm({...serviceForm, name: e.target.value})}
                          placeholder="e.g. Premium Interior Detailing"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Technical Scope</label>
                        <textarea
                          rows="6"
                          required
                          className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800 placeholder:text-slate-300 resize-none leading-relaxed"
                          value={serviceForm.description}
                          onChange={e => setServiceForm({...serviceForm, description: e.target.value})}
                          placeholder="Detail the precise steps, chemicals used, and estimated outcome..."
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-1 block">Category Pricing Engine</label>
                      <div className="bg-slate-50 rounded-[2rem] p-4 border border-slate-200 space-y-3 overflow-y-auto max-h-[420px] custom-scrollbar">
                        {vehicleTypes.map(type => (
                          <div key={type._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-primary/30 transition-all space-y-4 group/card">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                              <span className="font-black text-slate-900 text-sm">{type.name}</span>
                              <div className="w-2 h-2 rounded-full bg-slate-200 group-hover/card:bg-primary transition-colors"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="relative">
                                <Clock size={14} className="absolute left-4 top-[1.1rem] text-slate-300" />
                                <input
                                  type="number"
                                  placeholder="Mins"
                                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 rounded-xl text-xs font-black outline-none border border-transparent focus:border-primary/20 transition-all"
                                  value={serviceForm.config.find(c => c.category === type.name)?.durationMinutes || ''}
                                  onChange={(e) => handleConfigChange(type.name, 'durationMinutes', e.target.value)}
                                />
                              </div>
                              <div className="relative">
                                <span className="absolute left-4 top-[1.1rem] text-[10px] font-black text-slate-300">LKR</span>
                                <input
                                  type="number"
                                  placeholder="Rate"
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl text-xs font-black outline-none border border-transparent focus:border-primary/20 transition-all text-emerald-600"
                                  value={serviceForm.config.find(c => c.category === type.name)?.priceLKR || ''}
                                  onChange={(e) => handleConfigChange(type.name, 'priceLKR', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-8 border-t border-slate-100">
                    <button 
                      type="button" 
                      className="px-6 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em] text-[10px]" 
                      onClick={() => setShowModal(false)}
                    >
                      Discard Changes
                    </button>
                    <button 
                      type="submit" 
                      className="px-10 py-5 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px]"
                    >
                      Finalize & Sync
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleTypeSubmit} className="p-10 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category Identifier</label>
                      <input
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary transition-all font-bold text-slate-800"
                        value={typeForm.name}
                        onChange={e => setTypeForm({...typeForm, name: e.target.value})}
                        placeholder="e.g. Electric Sedan"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Internal Reference</label>
                      <input
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary transition-all font-bold text-slate-800"
                        value={typeForm.description}
                        onChange={e => setTypeForm({...typeForm, description: e.target.value})}
                        placeholder="Short classification for internal use..."
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-6 pt-8 border-t border-slate-100">
                    <button 
                      type="button" 
                      className="px-6 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em] text-[10px]" 
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-10 py-5 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px]"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CatalogManagement;
