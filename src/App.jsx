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

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/registre" element={<RegistrePAP />} />
        <Route path="/pap/:code_pap" element={<FichePAP />} />
        <Route path="/nouveau-pap" element={<NouveauPAP />} />
        <Route path="/biens" element={<GestionBiens />} />
        <Route path="/evaluations" element={<Evaluations />} />
        <Route path="/paiements" element={<Paiements />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/reclamations" element={<Reclamations />} />
        {/* Autres Phase 3: Conciliation, Audit, Portail citoyen */}
        <Route path="*" element={<div className="main-content"><h1>Page non trouvée</h1></div>} />
      </Route>
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
