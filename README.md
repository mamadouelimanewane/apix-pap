# APIX-PAP — Système de Gestion des PAP

Plateforme dédiée à la dématérialisation complète du processus de réinstallation et d'indemnisation des Personnes Affectées par les Projets (PAP) de l'APIX.

## 🎯 Objectifs

- ✅ Registre centralisé PAP (Neon PostgreSQL)
- ✅ Fiabilisation automatique des dossiers (détection d'anomalies)
- ✅ 7 rôles utilisateurs avec RBAC
- ✅ Workflow 13 étapes (du recensement à la clôture)
- ✅ Gestion documentaire (CNI, titres, PV, photos)
- ✅ Gestion des paiements (Chèque, Virement, Wave, Orange Money)
- ✅ Réclamations + Mécanisme de Gestion des Plaintes (MGP)
- ✅ Audit trail complet (traçabilité)
- ✅ Portail citoyen (suivi sans compte)

## 📂 Structure du Projet

```
apix-pap/
├── src/
│   ├── App.jsx                    # Routes principale
│   ├── main.jsx                   # Point d'entrée
│   ├── index.css                  # Design system
│   ├── context/
│   │   └── AuthContext.jsx        # Auth + rôles
│   ├── components/
│   │   └── Layout.jsx             # Sidebar + Header
│   └── pages/
│       ├── Login.jsx              # Page connexion
│       ├── Dashboard.jsx          # KPIs + statistiques
│       ├── RegistrePAP.jsx        # [Phase 2] Liste PAP
│       ├── FichePAP.jsx           # [Phase 2] Détail PAP
│       ├── GestionBiens.jsx       # [Phase 2] Biens
│       ├── Evaluations.jsx        # [Phase 2] Montants
│       ├── Paiements.jsx          # [Phase 2] Paiements
│       ├── Reclamations.jsx       # [Phase 3] Réclamations
│       ├── Conciliation.jsx       # [Phase 3] Conciliation
│       ├── AuditTrail.jsx         # [Phase 3] Historique
│       ├── GestionUtilisateurs.jsx # [Phase 3] Users
│       └── PortailCitoyen.jsx     # [Phase 3] Public
├── api/
│   ├── auth/
│   │   └── login.js               # [À créer] JWT login
│   ├── pap/
│   │   ├── index.js               # [À créer] CRUD PAP
│   │   └── fiabilisation.js       # [À créer] Analyse auto
│   ├── biens/
│   │   └── index.js               # [À créer] CRUD biens
│   ├── evaluations/
│   │   └── index.js               # [À créer] CRUD éval
│   ├── paiements/
│   │   └── index.js               # [À créer] CRUD paiements
│   ├── reclamations/
│   │   └── index.js               # [À créer] CRUD réclamations
│   ├── documents/
│   │   └── upload.js              # [À créer] Upload fichiers
│   └── stats/
│       └── dashboard.js           # [À créer] KPIs
├── lib/
│   ├── db.js                      # Pool Neon PostgreSQL
│   ├── fiabilisation.js           # Moteur analyse anomalies ✅
│   └── exports.js                 # [À créer] Export Excel/PDF
├── scripts/
│   ├── init-db.js                 # Initialiser schema ✅
│   ├── seed-data.js               # [À créer] Données test
│   └── import-excel.js            # [À créer] Import PAP Excel
├── .env.example
├── vite.config.js                 # Build optimisé ✅
├── tsconfig.json                  # TypeScript ✅
├── package.json                   # Dépendances ✅
└── README.md                      # Ceci

```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL (Neon)
- Variables d'env (.env.local)

### Installation
```bash
cd c:/gravity/apix-pap
npm install
npm run db:init              # Créer le schema
npm run dev                  # Démarrer dev server
```

### Accès
- Frontend: `http://localhost:5173`
- Demo: `admin@apix.sn` / `password`

## 📊 Modèle de Base de Données

### Tables principales
- **projets** — Grands travaux APIX
- **utilisateurs** — 7 rôles (admin, chef_projet, agent_terrain, etc.)
- **pap** — Personnes affectées (code_pap: PAP-2026-0001)
- **biens** — Propriétés affectées (code_bien: BIEN-2026-0001)
- **evaluations** — Montants initial/fiabilisé/validé
- **paiements** — Versements (code: PAY-2026-0001)
- **reclamations** — MGP (code: REC-2026-0001)
- **documents** — Fichiers rattachés
- **historique** — Audit trail complet

Voir `scripts/init-db.js` pour le schema complet.

## 🔄 Workflow 13 Étapes

```
NOUVEAU → RECENSÉ → À VÉRIFIER → FIABILISÉ → ÉVALUÉ 
→ EN CONCILIATION → CONCILIÉ → ACTE SIGNÉ → PV SIGNÉ 
→ À PAYER → PAYÉ → LIBÉRÉ → CLÔTURÉ
```

Statuts exceptionnels: EN RÉCLAMATION | EN CONTENTIEUX | SUSPENDU

## 🟢🟠🔴 Fiabilisation Automatique

Le moteur `lib/fiabilisation.js` analyse chaque dossier PAP et retourne:

```
{
  statut: 'complet' | 'incomplet' | 'anomalie',
  anomalies: [
    { code: 'DOUBLON_TEL', message: '...', severity: 'high' },
    { code: 'SANS_CNI', message: '...', severity: 'critical' },
    { code: 'PAYE_STATUT_ERRONE', message: '...', severity: 'high' },
    ...
  ],
  score: 95  // 0-100
}
```

Détections:
- ✅ Doublons téléphone/CNI
- ✅ Données obligatoires manquantes
- ✅ Incohérences superficie/montant
- ✅ Statut erroné vs. réalité paiement
- ✅ Documents manquants par statut
- ✅ Discordances chronologiques

## 👥 7 Rôles Utilisateurs

| Rôle | Permissions |
|------|-----------|
| Admin | Accès complet, gestion utilisateurs, paramètres |
| Chef Projet | Validation, consultation, rapports |
| Agent Terrain | Création/modification PAP, biens, photos |
| Agent Social | Données socio-éco, vulnérabilité |
| Agent Financier | Paiements, justificatifs, soldes |
| Responsable Juridique | Réclamations, contentieux, conciliation |
| Consultation | Lecture seule |

Chaque action enregistrée: `"M. X a modifié le montant de PAP-001 de 500K à 550K FCFA le 25/08/2026 à 10h35"`

## 📈 Tableau de Bord

KPIs en temps réel:
- Total PAP
- % Indemnisés
- Montant validé / Montant payé / Solde
- Réclamations ouvertes
- Dossiers clôturés
- Tendances paiements (6 derniers mois)
- Distribution statuts
- Modes paiement

## 📋 Phases de Développement

### Phase 1 ✅ Fondations (3-4 j)
- [x] Auth + JWT + rôles
- [x] DB schema + indices
- [x] Layout sidebar
- [x] Dashboard KPIs
- [ ] Moteur fiabilisation (backend API)

### Phase 2 (5-7 j) Cœur Métier
- [ ] Registre PAP (liste filtrable)
- [ ] Fiche PAP (complète + historique)
- [ ] Formulaire Nouveau PAP (wizard)
- [ ] Gestion Biens (Leaflet)
- [ ] Saisie Évaluations
- [ ] Gestion Paiements
- [ ] Upload Documents
- [ ] Fiabilisation UI (🟢🟠🔴)

### Phase 3 (3-4 j) Réclamations & Export
- [ ] Workflow Réclamations (REC-AAAA-XXXX)
- [ ] Conciliation (PV, montants)
- [ ] Audit Trail
- [ ] Gestion Utilisateurs
- [ ] Export Excel (xlsx) + PDF
- [ ] Portail Citoyen public

## 🗂️ Fichier Excel Existant

Script `scripts/import-excel.js` (à créer) permettra:
- Lire feuille Excel PAP
- Mapper colonnes → champs DB
- Détecter doublons/erreurs avant import
- Créer codes PAP/BIEN automatiques
- Enregistrer timestamp import

## 🔐 Variables d'Environnement

Voir `.env.example`:
```
DATABASE_URL=postgresql://...
JWT_SECRET=xxx
RESEND_API_KEY=xxx
```

Sur Vercel: ajouter dans Project Settings → Environment Variables

## 📚 Ressources

- Site APIX: https://www.apix.sn/
- Cahier charges complet: Voir conversation
- Modèle EXCEL existant: À charger
- Barèmes évaluation: À configurer dans admin

## 🤝 Support

Pour questions/blocages, consulter:
- Cahier des charges complet (ce dossier)
- `lib/fiabilisation.js` (logique anomalies)
- `scripts/init-db.js` (schema DB)

---

**Next**: Continuer Phase 2 (Registre PAP + Fiches) 🚀
