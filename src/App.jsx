import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RegistrePAP from './pages/RegistrePAP';
import FichePAP from './pages/FichePAP';
import NouveauPAP from './pages/NouveauPAP';
import GestionBiens from './pages/GestionBiens';
import Evaluations from './pages/Evaluations';
import Paiements from './pages/Paiements';
import Documents from './pages/Documents';
import Reclamations from './pages/Reclamations';
import Conciliation from './pages/Conciliation';
import AuditTrail from './pages/AuditTrail';
import PortailCitoyen from './pages/PortailCitoyen';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      Chargement...
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/portail-citoyen" element={<PortailCitoyen />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/registre" element={user ? <RegistrePAP /> : <Navigate to="/login" />} />
        <Route path="/pap/:code_pap" element={user ? <FichePAP /> : <Navigate to="/login" />} />
        <Route path="/nouveau-pap" element={user ? <NouveauPAP /> : <Navigate to="/login" />} />
        <Route path="/biens" element={user ? <GestionBiens /> : <Navigate to="/login" />} />
        <Route path="/evaluations" element={user ? <Evaluations /> : <Navigate to="/login" />} />
        <Route path="/paiements" element={user ? <Paiements /> : <Navigate to="/login" />} />
        <Route path="/documents" element={user ? <Documents /> : <Navigate to="/login" />} />
        <Route path="/reclamations" element={user ? <Reclamations /> : <Navigate to="/login" />} />
        <Route path="/conciliation" element={user ? <Conciliation /> : <Navigate to="/login" />} />
        <Route path="/audit" element={user ? <AuditTrail /> : <Navigate to="/login" />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={user ? <div className="main-content"><h1>Page non trouvée</h1></div> : <Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
