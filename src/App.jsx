import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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
import Exports from './pages/Exports';
import Imports from './pages/Imports';
import Editions from './pages/Editions';
import Notifications from './pages/Notifications';
import Rapports from './pages/Rapports';
import Search from './pages/Search';
import Backup from './pages/Backup';
import Webhooks from './pages/Webhooks';
import Cartographie from './pages/Cartographie';
import Cadastre from './pages/Cadastre';
import Impenses from './pages/Impenses';
import Dedommagement from './pages/Dedommagement';
import Travaux from './pages/Travaux';
import Terrain from './pages/Terrain';
import Recours from './pages/Recours';
import CompensationKPI from './pages/CompensationKPI';
import AcquisitionDocuments from './pages/AcquisitionDocuments';
import RiskAssessment from './pages/RiskAssessment';
// NEW: Premium Dashboard & Drill-Down Pages
import DashboardMetierAPIP from './components/DashboardMetierAPIP';
import { DrillDownPAP, DrillDownCompensation, DrillDownPayment } from './pages/DrillDownPhases';
// NEW: Notification System
import { getNotificationSystem } from './services/NotificationService';
// NEW: Advanced Features
import AdvancedFeatures from './pages/AdvancedFeatures';
// NEW: Portal Redesigned
import PortalHome from './pages/PortalHome';
import DashboardMetierRedesigned from './pages/DashboardMetierRedesigned';
// NEW: Portal Hub APIX-PAP (Like apix-phi)
import PortalHubAPIP from './pages/PortalHubAPIP';
// NEW: Communications & Planning
import Communications from './pages/Communications';
import Meetings from './pages/Meetings';
import Calendar from './pages/Calendar';

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

  // NEW: Initialiser notification system au démarrage
  useEffect(() => {
    if (user) {
      const notifications = getNotificationSystem();
      notifications.start();
      console.log('✅ Notification system started');
    }
  }, [user]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/portail-citoyen" element={<PortailCitoyen />} />
      <Route path="/login" element={<Login />} />

      {/* Portal Hub - without sidebar */}
      <Route path="/" element={user ? <PortalHubAPIP /> : <Navigate to="/login" />} />

      {/* Protected routes with Layout */}
      <Route element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
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
        <Route path="/editions" element={user ? <Editions /> : <Navigate to="/login" />} />
        <Route path="/exports" element={user ? <Exports /> : <Navigate to="/login" />} />
        <Route path="/imports" element={user ? <Imports /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
        <Route path="/rapports" element={user ? <Rapports /> : <Navigate to="/login" />} />
        <Route path="/search" element={user ? <Search /> : <Navigate to="/login" />} />
        <Route path="/backup" element={user ? <Backup /> : <Navigate to="/login" />} />
        <Route path="/webhooks" element={user ? <Webhooks /> : <Navigate to="/login" />} />
        <Route path="/cartographie" element={user ? <Cartographie /> : <Navigate to="/login" />} />
        <Route path="/cadastre" element={user ? <Cadastre /> : <Navigate to="/login" />} />
        <Route path="/impenses" element={user ? <Impenses /> : <Navigate to="/login" />} />
        <Route path="/dedommagement" element={user ? <Dedommagement /> : <Navigate to="/login" />} />
        <Route path="/travaux" element={user ? <Travaux /> : <Navigate to="/login" />} />
        <Route path="/terrain" element={user ? <Terrain /> : <Navigate to="/login" />} />
        <Route path="/recours" element={user ? <Recours /> : <Navigate to="/login" />} />
        <Route path="/compensation-kpi" element={user ? <CompensationKPI /> : <Navigate to="/login" />} />
        <Route path="/acquisition-documents" element={user ? <AcquisitionDocuments /> : <Navigate to="/login" />} />
        <Route path="/risk-assessment" element={user ? <RiskAssessment /> : <Navigate to="/login" />} />

        {/* NEW: Portal Legacy & Dashboard Routes */}
        <Route path="/portal-legacy" element={user ? <PortalHome /> : <Navigate to="/login" />} />
        <Route path="/dashboard-metier" element={user ? <DashboardMetierRedesigned /> : <Navigate to="/login" />} />
        <Route path="/dashboard-metier-classic" element={user ? <DashboardMetierAPIP /> : <Navigate to="/login" />} />
        <Route path="/drill/phase1" element={user ? <DrillDownPAP /> : <Navigate to="/login" />} />
        <Route path="/drill/phase3" element={user ? <DrillDownCompensation /> : <Navigate to="/login" />} />
        <Route path="/drill/phase4" element={user ? <DrillDownPayment /> : <Navigate to="/login" />} />

        {/* NEW: Advanced Features Routes */}
        <Route path="/advanced-features" element={user ? <AdvancedFeatures /> : <Navigate to="/login" />} />

        {/* NEW: Communications & Planning Routes */}
        <Route path="/communications" element={user ? <Communications /> : <Navigate to="/login" />} />
        <Route path="/meetings" element={user ? <Meetings /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={user ? <Calendar /> : <Navigate to="/login" />} />
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
