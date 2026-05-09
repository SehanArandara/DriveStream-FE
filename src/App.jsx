import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages (to be created)
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import SetupStaff from './pages/SetupStaff';
import ForgotPassword from './pages/ForgotPassword';
import StaffLogin from './pages/StaffLogin';
import StaffManagement from './pages/StaffManagement';
import WelcomePortal from './pages/WelcomePortal';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import MyAppointments from './pages/MyAppointments';
import BookingDetail from './pages/BookingDetail';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import VehicleDirectory from './pages/VehicleDirectory';
import CatalogManagement from './pages/CatalogManagement';
import AdminBookings from './pages/AdminBookings';
import Jobs from './pages/Jobs';
import Invoices from './pages/Invoices';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import CompleteProfile from './pages/CompleteProfile';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ChatBotWidget from './components/ChatBotWidget';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen flex items-center justify-center font-bold text-primary animate-pulse">
      Loading DriveStream...
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  // Enforce Phone & Verification for customers
  if (user.role === 'customer' && !user.isVerified) {
    if (!user.phone) return <Navigate to="/complete-profile" />;
    return <Navigate to="/verify-otp" state={{ userId: user._id, phone: user.phone }} />;
  }
  
  // If roles are specified, check if user has permission
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[280px] bg-slate-50/50 relative overflow-x-hidden">
        <Navbar user={user} />
        <main className="p-12 flex-1 animate-fade overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Show DriveBot only to: public visitors (no user) and customers.
// Hidden for admin and technician roles — they have internal tools.
const ChatBotGate = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && user.role !== 'customer') return null;
  return <ChatBotWidget />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/welcome" element={<WelcomePortal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/setup-staff" element={<SetupStaff />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />

          {/* ── Protected Routes ── */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardLayout><Dashboard /></DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/staff" element={
            <PrivateRoute>
              <DashboardLayout><StaffManagement /></DashboardLayout>
            </PrivateRoute>
          } />
          
          <Route path="/bookings" element={
            <PrivateRoute>
              <DashboardLayout><Bookings /></DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/my-appointments" element={
            <PrivateRoute>
              <DashboardLayout><MyAppointments /></DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/my-appointments/:id" element={
            <PrivateRoute>
              <DashboardLayout><BookingDetail /></DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/vehicles" element={
            <PrivateRoute>
              <DashboardLayout><Vehicles /></DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/vehicles/:id" element={
            <PrivateRoute>
              <DashboardLayout><VehicleDetail /></DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/admin/vehicles" element={
            <PrivateRoute roles={['admin', 'technician']}>
              <DashboardLayout><VehicleDirectory /></DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/admin/catalog" element={
            <PrivateRoute roles={['admin']}>
              <DashboardLayout><CatalogManagement /></DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/admin/bookings" element={
            <PrivateRoute roles={['admin']}>
              <DashboardLayout><AdminBookings /></DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/jobs" element={
            <PrivateRoute>
              <DashboardLayout><Jobs /></DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/invoices" element={
            <PrivateRoute>
              <DashboardLayout><Invoices /></DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
        <ChatBotGate />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
