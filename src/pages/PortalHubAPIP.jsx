// Portal Hub APIX-PAP - Organisé comme apix-phi/portal
// Catégories colorées avec boxes et hover effects

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, DollarSign, AlertCircle, BarChart3, Shield,
  MapPin, Building2, CheckCircle, Clock, Zap, ArrowRight,
  TrendingUp, Briefcase, Heart, Eye, Download, Lock,
  MessageSquare, Send, Bell, Calendar, Settings, Layers,
  Workflow, Image, Scan, Folder, ListCheck, GitBranch
} from 'lucide-react';

const MODULE_CATEGORIES = [
  {
    category: "Gestion PAP - Création & Enregistrement",
    color: "#1e40af", // Blue
    items: [
      { path: '/nouveau-pap', icon: <FileText size={32} />, title: "Créer PAP", desc: "Enregistrer une nouvelle personne affectée par le projet", color: "#3b82f6", isNew: false },
      { path: '/registre', icon: <Users size={32} />, title: "Registre PAP", desc: "Liste complète et recherche des PAPs enregistrées", color: "#60a5fa" },
      { path: '/drill/phase1', icon: <Building2 size={32} />, title: "Drill-Down PAP", desc: "Vue détaillée avec statistiques et filtres avancés", color: "#93c5fd" },
      { path: '/biens', icon: <Building2 size={32} />, title: "Gérer Biens", desc: "Gestion complète des propriétés et terrains", color: "#bfdbfe" },
    ]
  },
  {
    category: "Évaluation & Dédommagement",
    color: "#7c3aed", // Purple
    items: [
      { path: '/evaluations', icon: <CheckCircle size={32} />, title: "Évaluations", desc: "Évaluer les biens avec photos et validation", color: "#8b5cf6", isNew: false },
      { path: '/dedommagement', icon: <DollarSign size={32} />, title: "Dédommagement", desc: "Calculer montants et générer certificats", color: "#a78bfa" },
      { path: '/drill/phase3', icon: <BarChart3 size={32} />, title: "Dossiers Compensation", desc: "Vue détaillée des dossiers par statut d'approbation", color: "#c4b5fd" },
      { path: '/compensation-kpi', icon: <TrendingUp size={32} />, title: "KPI Compensation", desc: "Analytics en temps réel des compensations", color: "#ddd6fe" },
    ]
  },
  {
    category: "Paiement & Confirmations",
    color: "#15803d", // Green
    items: [
      { path: '/paiements', icon: <DollarSign size={32} />, title: "Paiements", desc: "Initier et confirmer les paiements (5 modes)", color: "#22c55e", isNew: false },
      { path: '/drill/phase4', icon: <BarChart3 size={32} />, title: "Distribution Modes", desc: "Drill-down répartition par Wave, Orange Money, etc.", color: "#4ade80" },
      { path: '/cartographie', icon: <MapPin size={32} />, title: "Vérification Géo", desc: "Vérifier localisation et confirmer paiements", color: "#86efac" },
      { path: '/terrain', icon: <CheckCircle size={32} />, title: "Confirmations", desc: "Confirmations terrain avant libération", color: "#bbf7d0" },
    ]
  },
  {
    category: "Réclamations & Conciliation",
    color: "#b91c1c", // Red
    items: [
      { path: '/reclamations', icon: <AlertCircle size={32} />, title: "Enregistrer", desc: "Créer et enregistrer les réclamations PAPs", color: "#ef4444", isNew: false },
      { path: '/conciliation', icon: <Users size={32} />, title: "Conciliation", desc: "Processus de résolution des conflits", color: "#f87171" },
      { path: '/recours', icon: <Clock size={32} />, title: "Suivi Recours", desc: "Tracking complet des appels et recours", color: "#fca5a5" },
      { path: '/rapports', icon: <CheckCircle size={32} />, title: "Rapports Résolution", desc: "Rapports détaillés et statistiques réclamations", color: "#fdcccb" },
    ]
  },
  {
    category: "Analytics & Intelligence",
    color: "#0369a1", // Cyan
    items: [
      { path: '/dashboard-metier', icon: <BarChart3 size={32} />, title: "Dashboard Métier", desc: "Vue 6 phases avec KPIs temps réel", color: "#06b6d4", isNew: true },
      { path: '/advanced-features', icon: <Zap size={32} />, title: "Advanced Analytics", desc: "BI avancée + ML predictions + rapports", color: "#22d3ee" },
      { path: '/search', icon: <Eye size={32} />, title: "Recherche Avancée", desc: "Recherche globale avec filtres et tendances", color: "#67e8f9" },
      { path: '/notifications', icon: <Heart size={32} />, title: "Notifications", desc: "Centre notifications avec alertes intelligentes", color: "#a5f3fc" },
    ]
  },
  {
    category: "Outils & Conformité",
    color: "#475569", // Slate
    items: [
      { path: '/audit', icon: <Shield size={32} />, title: "Audit Trail", desc: "Compliance audit et intégrité blockchain", color: "#64748b", isNew: false },
      { path: '/documents', icon: <FileText size={32} />, title: "Documents", desc: "Gestion centralisée des documents", color: "#78909c" },
      { path: '/exports', icon: <Download size={32} />, title: "Import/Export", desc: "Exporter et importer données en masse", color: "#90a4ae" },
      { path: '/webhooks', icon: <Lock size={32} />, title: "Sécurité", desc: "Configuration sécurité et intégrations", color: "#a0aec0" },
    ]
  },
  {
    category: "Communication & Collaboration",
    color: "#dc2626", // Red-600
    items: [
      { path: '/notifications', icon: <MessageSquare size={32} />, title: "Messages", desc: "Messagerie directe avec les PAPs et équipes", color: "#f87171", isNew: false },
      { path: '/notifications', icon: <Bell size={32} />, title: "Alertes Système", desc: "Notifications critiques et mises à jour en temps réel", color: "#fca5a5" },
      { path: '/rapports', icon: <FileText size={32} />, title: "Rapports Partage", desc: "Partager rapports et analyses avec stakeholders", color: "#fed7aa" },
      { path: '/editions', icon: <Send size={32} />, title: "Broadcast", desc: "Envoi de messages massifs aux PAPs", color: "#fdcccb" },
    ]
  },
  {
    category: "Planification & Réunions",
    color: "#2563eb", // Blue-600
    items: [
      { path: '/rapports', icon: <Calendar size={32} />, title: "Calendrier", desc: "Gérer réunions et événements d'équipe", color: "#60a5fa", isNew: true },
      { path: '/backup', icon: <Users size={32} />, title: "Réunions", desc: "Planifier et suivre les réunions PAPs", color: "#93c5fd" },
      { path: '/search', icon: <Briefcase size={32} />, title: "Agenda Équipe", desc: "Synchroniser calendriers et trouver créneaux optimaux", color: "#bfdbfe" },
      { path: '/cartographie', icon: <Layers size={32} />, title: "Ressources", desc: "Allocation ressources et planification de projet", color: "#dbeafe" },
    ]
  },
  {
    category: "Workflows & Dossiers",
    color: "#7c22a0", // Violet-700
    items: [
      { path: '/registre', icon: <Workflow size={32} />, title: "Workflow Dossier", desc: "Suivi complet du cycle de vie dossier PAP", color: "#a855f7", isNew: true },
      { path: '/pap/:code_pap', icon: <ListCheck size={32} />, title: "Étapes Dossier", desc: "Visualiser et gérer chaque étape du processus", color: "#c084fc" },
      { path: '/dedommagement', icon: <GitBranch size={32} />, title: "Branches Processus", desc: "Parcours alternatifs et escalades dossier", color: "#d8b4fe" },
      { path: '/rapports', icon: <Folder size={32} />, title: "Archivage", desc: "Gérer historique et documents archivés", color: "#e9d5ff" },
    ]
  },
  {
    category: "Acquisition & Documents",
    color: "#059669", // Emerald-600
    items: [
      { path: '/acquisition-documents', icon: <Scan size={32} />, title: "Scanner OCR", desc: "Numériser et extraire données des documents", color: "#10b981", isNew: true },
      { path: '/documents', icon: <Image size={32} />, title: "Galerie Médias", desc: "Gérer photos et vidéos des propriétés", color: "#34d399" },
      { path: '/risk-assessment', icon: <AlertCircle size={32} />, title: "Validation", desc: "Vérifier conformité et qualité documents", color: "#6ee7b7" },
      { path: '/editions', icon: <FileText size={32} />, title: "Templates", desc: "Modèles documents et certificats", color: "#a7f3d0" },
    ]
  }
];

const PortalHubAPIP = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      padding: '2rem 3rem',
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#1e293b'
    }}>
      {/* Header Hero */}
      <div style={{
        marginBottom: '3rem',
        background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
        padding: '3.5rem 3rem',
        borderRadius: '20px',
        color: 'white',
        boxShadow: '0 10px 25px rgba(30, 64, 175, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-40px', right: '50px', width: '100px', height: '100px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}></div>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, position: 'relative', zIndex: 10 }}>
          Bienvenue au Hub APIX-PAP
        </h1>
        <p style={{ fontSize: '1rem', color: '#e0e7ff', marginTop: '0.5rem', position: 'relative', zIndex: 10 }}>
          Plateforme complète de gestion des Personnes Affectées par les Projets au Sénégal.
        </p>
      </div>

      {/* Modules Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {MODULE_CATEGORIES.map((category, catIdx) => (
          <div key={catIdx}>
            {/* Category Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
              <div style={{
                width: '8px',
                height: '30px',
                background: category.color,
                borderRadius: '4px'
              }}></div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: category.color, margin: 0 }}>
                {category.category}
              </h2>
            </div>

            {/* Items Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.2rem'
            }}>
              {category.items.map((mod, index) => (
                <div
                  key={index}
                  onClick={() => navigate(mod.path)}
                  style={{
                    background: 'white',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    boxShadow: `0 4px 0 ${mod.color}30, 0 4px 6px -1px rgba(0, 0, 0, 0.05)`,
                    border: `1px solid ${mod.color}40`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 0 ${mod.color}90, 0 15px 20px -5px rgba(0, 0, 0, 0.15)`;
                    e.currentTarget.style.borderColor = mod.color;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 0 ${mod.color}30, 0 4px 6px -1px rgba(0, 0, 0, 0.05)`;
                    e.currentTarget.style.borderColor = `${mod.color}40`;
                  }}
                >
                  {/* New Badge */}
                  {mod.isNew && (
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      background: '#ef4444',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      letterSpacing: '1px',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                    }}>
                      NOUVEAU
                    </div>
                  )}

                  {/* Icon Box */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '10px',
                    background: `${mod.color}15`,
                    color: mod.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    {mod.icon}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.4rem', color: '#0f172a' }}>
                    {mod.title}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4', flex: 1 }}>
                    {mod.desc}
                  </p>

                  {/* CTA */}
                  <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    color: mod.color,
                    fontWeight: '700',
                    fontSize: '1.05rem',
                    gap: '0.5rem'
                  }}>
                    Accéder <ArrowRight size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortalHubAPIP;
