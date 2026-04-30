import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { 
  Car, 
  ArrowLeft, 
  Settings, 
  Calendar, 
  Fuel, 
  Zap, 
  Fingerprint, 
  PlusCircle,
  History,
  ShieldCheck
} from 'lucide-react';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const { data } = await api.get(`/vehicles/${id}`);
      setVehicle(data);
    } catch (err) {
      toast.error('Could not load vehicle profile');
      navigate('/vehicles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading Profile...</div>;
  if (!vehicle) return null;

  return (
    <div className="dashboard-content animate-fade">
      <div className="mb-6">
        <button onClick={() => navigate('/vehicles')} className="flex items-center gap-2 text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
          <ArrowLeft size={18} /> Back to Garage
        </button>
      </div>

      <div className="vehicle-profile-container">
        {/* Main Info Card */}
        <div className="card vehicle-main-card">
          <div className="profile-header">
            <div className="vehicle-avatar">
              <Car size={48} />
            </div>
            <div className="header-text">
              <div className="flex items-center gap-3">
                <h1>{vehicle.brand} {vehicle.model}</h1>
                <span className="badge badge-primary">{vehicle.category}</span>
              </div>
              <p className="text-xl font-bold text-primary mt-1 tracking-widest">{vehicle.registrationNumber}</p>
            </div>
            <div className="header-actions">
              <button className="btn btn-primary" onClick={() => navigate('/bookings')}>
                <PlusCircle size={18} /> Book Service
              </button>
            </div>
          </div>

          <div className="details-grid mt-8">
            <div className="detail-box">
              <label><Calendar size={14} /> Manufacture Year</label>
              <p>{vehicle.manufactureYear}</p>
            </div>
            <div className="detail-box">
              <label><Fuel size={14} /> Fuel Type</label>
              <p>{vehicle.fuelType}</p>
            </div>
            <div className="detail-box">
              <label><Zap size={14} /> Engine Capacity</label>
              <p>{vehicle.engineCapacity ? `${vehicle.engineCapacity} CC` : 'Not Specified'}</p>
            </div>
            <div className="detail-box">
              <label><Fingerprint size={14} /> Chassis Number</label>
              <p className="font-mono">{vehicle.chassisNumber || 'Not Specified'}</p>
            </div>
          </div>
        </div>

        {/* History Placeholder */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <History size={20} className="text-muted" />
            <h2 className="text-xl">Service History</h2>
          </div>
          
          <div className="card text-center py-12 bg-slate-50 border-dashed">
            <div className="text-muted">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
              <p>No service history found for this vehicle.</p>
              <p className="text-sm">History will appear here after your first service job.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
