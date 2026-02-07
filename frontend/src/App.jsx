import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import SalesHistory from './pages/SalesHistory';
import Analytics from './pages/Analytics';
import Employees from './pages/Employees';
import EmployeeDashboard from './pages/EmployeeDashboard'; // Just for backup import if needed, but utilized inside Dashboard
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* Protected Routes wrapped in Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Dashboard route automatically switches between Admin/Employee via Dashboard.jsx */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/sales-history" element={<SalesHistory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/employees" element={<Employees />} />

              {/* Redirect unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer position="top-right" theme="dark" />
      </Router>
    </AuthProvider>
  );
}

export default App;
