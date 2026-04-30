import { useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { UserPlus, Users, Trash2, CheckCircle, XCircle, Mail, Phone, BadgeCheck } from 'lucide-react';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '', email: '', phone: '', role: 'technician'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/staff');
      setStaff(data.staff);
    } catch (err) {
      toast.error('Failed to fetch staff records');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/create-staff', newStaff);
      toast.success('Invitation sent to staff member!');
      setShowInviteModal(false);
      setNewStaff({ name: '', email: '', phone: '', role: 'technician' });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create staff');
    }
  };

  const toggleStatus = async (id, currentStatus, name) => {
    // Senior SE: Confirmation Interceptor
    const action = currentStatus ? 'DEACTIVATE' : 'ACTIVATE';
    const confirm = window.confirm(`Are you sure you want to ${action} ${name}'s account?`);
    
    if (!confirm) return;

    try {
      await api.patch(`/staff/${id}/status`, { isActive: !currentStatus });
      toast.success(`${name} has been ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const currentLoggedUser = JSON.parse(localStorage.getItem('ds_user'));
  const isSuperAdmin = currentLoggedUser?.isSuperAdmin;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users size={40} className="text-primary" />
            Service Team
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage platform access, roles, and workshop technician availability.</p>
        </div>
        <button 
          className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest text-xs"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus size={18} /> Onboard New Staff
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
           <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-primary mb-4"></div>
           <span className="text-[10px] font-black uppercase tracking-widest">Syncing team records...</span>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Team Member</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Communication</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Access Level</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">System Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                        <Users size={32} />
                      </div>
                      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No manageable staff found</p>
                    </td>
                  </tr>
                ) : staff.map((member) => (
                  <tr key={member._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shadow-lg ${
                          member.role === 'admin' ? 'bg-primary shadow-primary/30' : 'bg-slate-900 shadow-slate-200'
                        }`}>
                          {member.name[0]}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                            {member.name}
                            {member.isSuperAdmin && <BadgeCheck size={16} className="text-primary" />}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest">ID: {member._id.substr(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-600 flex items-center gap-2 tracking-tight">
                          <Mail size={14} className="text-slate-300" /> {member.email}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                          <Phone size={12} className="text-slate-300" /> {member.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        member.role === 'admin' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {member.role === 'admin' ? 'Management' : 'Service Tech'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {member.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                          <CheckCircle size={14} /> ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100">
                          <XCircle size={14} /> DEACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {member._id !== currentLoggedUser._id ? (
                        <button 
                          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            member.isActive 
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                          }`}
                          onClick={() => toggleStatus(member._id, member.isActive, member.name)}
                        >
                          {member.isActive ? 'Suspend' : 'Reinstate'}
                        </button>
                      ) : (
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Current User</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowInviteModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-900 p-8 text-white">
              <h2 className="text-2xl font-black">Staff Onboarding</h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Configure credentials for new team members.</p>
            </div>
            
            <form onSubmit={handleInvite} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                <input 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all font-bold placeholder:text-slate-300"
                  value={newStaff.name} 
                  onChange={e => setNewStaff({...newStaff, name: e.target.value})} 
                  placeholder="e.g. John Doe" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all font-bold placeholder:text-slate-300"
                  value={newStaff.email} 
                  onChange={e => setNewStaff({...newStaff, email: e.target.value})} 
                  placeholder="staff@drivestream.lk" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number (Setup SMS)</label>
                <input 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all font-bold placeholder:text-slate-300"
                  value={newStaff.phone} 
                  onChange={e => setNewStaff({...newStaff, phone: e.target.value})} 
                  placeholder="+94 7X XXX XXXX" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Access Level</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all font-black appearance-none"
                  value={newStaff.role} 
                  onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                >
                  <option value="technician">🛠️ SERVICE TECHNICIAN</option>
                  {isSuperAdmin && (
                    <option value="admin">🏢 SERVICE ADMINISTRATOR (MANAGER)</option>
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
                <button type="button" className="px-6 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-xs" onClick={() => setShowInviteModal(false)}>DISCARD</button>
                <button type="submit" className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform uppercase tracking-widest text-xs">SEND INVITE SMS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
