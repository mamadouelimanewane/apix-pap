import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, DollarSign, AlertCircle,
  Settings, LogOut, Menu, X, Map, CheckCircle, MessageSquare, History
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de Bord' },
    { path: '/registre', icon: Users, label: 'Registre PAP' },
    { path: '/biens', icon: Map, label: 'Gestion Biens' },
    { path: '/evaluations', icon: CheckCircle, label: 'Évaluations' },
    { path: '/paiements', icon: DollarSign, label: 'Paiements' },
    { path: '/reclamations', icon: AlertCircle, label: 'Réclamations' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/conciliation', icon: MessageSquare, label: 'Conciliation' },
  ];

  const adminItems = [
    { path: '/audit', icon: History, label: 'Audit Trail' },
    { path: '/utilisateurs', icon: Users, label: 'Utilisateurs' },
    { path: '/settings', icon: Settings, label: 'Paramètres' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
            APIX<span style={{ color: '#FCD116' }}>-PAP</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Menu Principal
            </h3>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.7)',
                  background: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                  marginBottom: '0.5rem',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                }}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </div>

          {/* Admin items */}
          {user?.role === 'admin' && (
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                Administration
              </h3>
              {adminItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.7)',
                    background: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                    marginBottom: '0.5rem',
                    textDecoration: 'none',
                  }}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* User info */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          {user && (
            <>
              <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: '600' }}>{user.nom} {user.prenom}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}
              >
                <LogOut size={18} />
                {sidebarOpen && <span>Déconnexion</span>}
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
