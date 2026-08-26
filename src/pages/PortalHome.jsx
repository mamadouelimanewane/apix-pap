// Portal Home - Organisation Premium inspirée APIX-Phi
// Accueil centralisé avec modules par thème métier

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Users, DollarSign, AlertCircle, BarChart3, Settings,
  MapPin, Building2, CheckCircle, Clock, Zap, Shield,
  ChevronRight, Search, Bell, User, Menu, X
} from 'lucide-react';

export default function PortalHome() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modules organisés par thème
  const modules = [
    {
      theme: 'Gestion PAP',
      color: 'from-blue-600 to-cyan-600',
      icon: Users,
      items: [
        { name: 'Créer PAP', path: '/nouveau-pap', icon: FileText, desc: 'Enregistrer nouvelle personne' },
        { name: 'Registre PAP', path: '/registre', icon: FileText, desc: 'Liste complète des PAPs' },
        { name: 'Détail PAP', path: '/drill/phase1', icon: Building2, desc: 'Drill-down PAP register' },
        { name: 'Gérer Biens', path: '/biens', icon: Building2, desc: 'Properties management' }
      ]
    },
    {
      theme: 'Évaluation & Compensation',
      color: 'from-purple-600 to-pink-600',
      icon: BarChart3,
      items: [
        { name: 'Évaluations', path: '/evaluations', icon: CheckCircle, desc: 'Valuer properties' },
        { name: 'Dédommagement', path: '/dedommagement', icon: DollarSign, desc: 'Calcul compensation' },
        { name: 'Dossiers Compensation', path: '/drill/phase3', icon: FileText, desc: 'Drill-down compensation' },
        { name: 'KPI Compensation', path: '/compensation-kpi', icon: BarChart3, desc: 'Analytics compensation' }
      ]
    },
    {
      theme: 'Paiement & Confirmations',
      color: 'from-green-600 to-emerald-600',
      icon: DollarSign,
      items: [
        { name: 'Paiements', path: '/paiements', icon: DollarSign, desc: 'Manage payments' },
        { name: 'Distribution', path: '/drill/phase4', icon: BarChart3, desc: 'Drill-down payment modes' },
        { name: 'Vérification', path: '/cartographie', icon: MapPin, desc: 'Payment verification' },
        { name: 'Confirmations', path: '/terrain', icon: CheckCircle, desc: 'Confirm payments' }
      ]
    },
    {
      theme: 'Réclamations & Conciliation',
      color: 'from-orange-600 to-red-600',
      icon: AlertCircle,
      items: [
        { name: 'Réclamations', path: '/reclamations', icon: AlertCircle, desc: 'Register complaints' },
        { name: 'Conciliation', path: '/conciliation', icon: Users, desc: 'Conflict resolution' },
        { name: 'Suivi Recours', path: '/recours', icon: Clock, desc: 'Appeal tracking' },
        { name: 'Résolution', path: '/rapports', icon: CheckCircle, desc: 'Resolution reports' }
      ]
    },
    {
      theme: 'Analytics & Intelligence',
      color: 'from-indigo-600 to-blue-600',
      icon: BarChart3,
      items: [
        { name: 'Dashboard Métier', path: '/dashboard-metier', icon: BarChart3, desc: '6 phases overview' },
        { name: 'Advanced Analytics', path: '/advanced-features', icon: Zap, desc: 'BI + ML predictions' },
        { name: 'Rapports', path: '/rapports', icon: FileText, desc: 'Reports & exports' },
        { name: 'Tendances', path: '/search', icon: BarChart3, desc: 'Trends analysis' }
      ]
    },
    {
      theme: 'Outils & Conformité',
      color: 'from-teal-600 to-cyan-600',
      icon: Shield,
      items: [
        { name: 'Audit Trail', path: '/audit', icon: Shield, desc: 'Compliance audit' },
        { name: 'Documents', path: '/documents', icon: FileText, desc: 'Document management' },
        { name: 'Imports/Exports', path: '/exports', icon: Zap, desc: 'Data import/export' },
        { name: 'Cartographie', path: '/cartographie', icon: MapPin, desc: 'Geo mapping' }
      ]
    }
  ];

  const filteredModules = modules.map(module => ({
    ...module,
    items: module.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(module => module.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">APIX-PAP</h1>
              <p className="text-sm text-blue-100">Portail Gestion Personnes Affectées par Projets</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Bell className="w-6 h-6 cursor-pointer hover:opacity-80" />
            <User className="w-6 h-6 cursor-pointer hover:opacity-80" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-t border-blue-500 bg-blue-700 bg-opacity-50 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3 bg-white bg-opacity-10 rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-blue-200" />
            <input
              type="text"
              placeholder="Rechercher un module ou action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-blue-200 outline-none flex-1"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Intro Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">Bienvenue au Portail APIX-PAP</h2>
          <p className="text-blue-100 text-lg max-w-2xl">
            Accédez à tous les modules de gestion des Personnes Affectées par les Projets.
            Organisé par thème métier pour une navigation intuitive.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="space-y-8">
          {filteredModules.map((module, idx) => (
            <div key={idx}>
              {/* Module Header */}
              <div className={`mb-6 pb-3 border-b-2 border-gradient-to-r bg-gradient-to-r ${module.color} bg-clip-text`}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-gradient-to-br ${module.color} rounded-lg text-white shadow-lg`}>
                    <module.icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-2xl font-bold bg-gradient-to-r ${module.color} bg-clip-text text-transparent`}>
                    {module.theme}
                  </h3>
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {module.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    onClick={() => navigate(item.path)}
                    className={`group bg-gradient-to-br ${module.color} p-0.5 rounded-xl cursor-pointer hover:shadow-2xl transition-all`}
                  >
                    <div className="bg-slate-800 rounded-[10px] p-5 h-full flex flex-col justify-between group-hover:bg-slate-700 transition-colors">
                      {/* Icon & Title */}
                      <div>
                        <div className={`p-2 bg-gradient-to-br ${module.color} rounded-lg w-fit mb-3`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-1">{item.name}</h4>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>

                      {/* Arrow */}
                      <div className="flex justify-end mt-4">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">Aucun module ne correspond à votre recherche</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-3">À Propos</h4>
              <p className="text-gray-400 text-sm">APIX-PAP: Plateforme de gestion PAP moderne & sécurisée</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Version</h4>
              <p className="text-gray-400 text-sm">v1.0.1</p>
              <p className="text-gray-500 text-xs">Production Ready</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Support</h4>
              <p className="text-gray-400 text-sm">Email: support@apix-pap.com</p>
              <p className="text-gray-500 text-xs">24/7 Available</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Sécurité</h4>
              <p className="text-gray-400 text-sm">✓ GDPR Compliant</p>
              <p className="text-gray-500 text-xs">Blockchain Audit Trail</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 text-center text-gray-500 text-sm">
            <p>© 2026 APIX-PAP. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
