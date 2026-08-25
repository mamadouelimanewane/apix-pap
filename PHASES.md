# Plan de Développement APIX-PAP

## Phase 1 ✅ Fondations (3-4 jours) — COMPLÉTÉE

### Architecture & Infrastructure
- [x] Initialiser projet React 19 + Vite 8
- [x] Configure TypeScript strict
- [x] Setup design system (couleurs APIX, composants)
- [x] Vercel deployment config

### Authentification
- [ ] API `/api/auth/login` (JWT)
- [ ] API `/api/auth/refresh` (token rotation)
- [ ] OTP login (Resend email)
- [ ] AuthContext + useAuth hook ✅
- [ ] ProtectedRoute component

### Base de Données
- [x] Neon PostgreSQL schema (11 tables)
- [x] Indices pour performance
- [x] Migration scripts
- [ ] Authentification DB (mot de passe hasho)

### UI Core
- [x] Layout (sidebar + main content)
- [x] Login page
- [x] Dashboard page (KPIs)
- [x] Design system CSS ✅
- [ ] Button, Card, Badge components

### KPIs & Statistiques
- [x] Dashboard skeleton
- [x] Recharts integration
- [ ] API `/api/stats/dashboard` (KPIs en temps réel)
- [ ] API `/api/stats/charts` (données graphiques)

---

## Phase 2 (5-7 jours) CŒUR MÉTIER

### Registre PAP
- [ ] Page `/registre` — Liste PAP
  - [ ] Tableau avec pagination
  - [ ] Filtres (statut, commune, projet)
  - [ ] Recherche (code PAP, nom, téléphone)
  - [ ] Actions (voir fiche, éditer, supprimer)
- [ ] API `/api/pap/list` (CRUD + filtres)
- [ ] API `/api/pap/search` (recherche fulltext)

### Fiche PAP Détaillée
- [ ] Page `/pap/:code_pap` — Vue complète
  - [ ] Identité + contacts
  - [ ] Adresse + géolocalisation (Leaflet)
  - [ ] Données socio-éco
  - [ ] Liste biens liés
  - [ ] Historique évaluations
  - [ ] Historique paiements
  - [ ] Réclamations si existantes
  - [ ] Documents (galerie)
  - [ ] Audit trail (historique modifs)
  - [ ] Badge fiabilisation 🟢🟠🔴
- [ ] API `/api/pap/:id` (GET détail)

### Nouveau PAP (Wizard)
- [ ] Page `/nouveau-pap` — Formulaire multi-étapes
  - [ ] Étape 1: Identité + contact
  - [ ] Étape 2: Adresse + géolocalisation
  - [ ] Étape 3: Données socio-éco
  - [ ] Étape 4: Upload documents (CNI)
  - [ ] Review + confirmation
  - [ ] Génération code PAP auto
- [ ] API `/api/pap/create` (POST)
- [ ] Validation client + serveur

### Gestion Biens
- [ ] Page `/biens` — Liste biens par PAP
  - [ ] Tableau biens par projet
  - [ ] Édition inline type/superficie
  - [ ] Carte Leaflet (points géolocalisés)
  - [ ] Actions (ajouter, éditer, supprimer)
- [ ] API `/api/biens/list`
- [ ] API `/api/biens/create`
- [ ] API `/api/biens/:id` (PUT/DELETE)
- [ ] Génération code BIEN auto

### Évaluations
- [ ] Page `/evaluations` — Montants
  - [ ] Tableau biens + montants
  - [ ] Édition (initial → fiabilisé → validé)
  - [ ] Statut validation (✅ / ⏳ / ❌)
  - [ ] Observations/commentaires
- [ ] API `/api/evaluations/create`
- [ ] API `/api/evaluations/:id` (PUT)
- [ ] API `/api/evaluations/valider` (changement statut)

### Paiements
- [ ] Page `/paiements` — Gestion versements
  - [ ] Tableau paiements (PAP, montant, mode, statut)
  - [ ] Calcul auto solde (validé - payé)
  - [ ] Filtres par mode (Chèque, Virement, Wave, OM)
  - [ ] Upload justificatif
  - [ ] Édition montant/date
- [ ] API `/api/paiements/create`
- [ ] API `/api/paiements/:id` (PUT)
- [ ] API `/api/paiements/list`
- [ ] Validation montant vs. validé

### Gestion Documents
- [ ] Component `DocumentUpload` (drag & drop)
- [ ] Page `/documents` — Galerie par PAP
  - [ ] Filtrer par type (CNI, TF, PV, Photo, etc.)
  - [ ] Preview image/PDF
  - [ ] Télécharger
  - [ ] Supprimer
- [ ] API `/api/documents/upload` (multipart)
- [ ] API `/api/documents/:pap_id` (list)
- [ ] Stockage: Vercel Blob (prod) ou /public (dev)

### Fiabilisation Auto
- [ ] Intégrer `lib/fiabilisation.js` en API
- [ ] API `/api/pap/fiabiliser/:id` (POST)
  - Retour: `{ statut, anomalies[], score }`
- [ ] Afficher badge sur ligne PAP
  - 🟢 Complet | 🟠 Incomplet | 🔴 Anomalies
- [ ] Détail anomalies quand clic
- [ ] Enregistrer résultat en DB

### Audit Trail
- [ ] Historique table enregistrant:
  - Action (CREATE/UPDATE/DELETE/STATUS_CHANGE)
  - Champ modifié
  - Ancienne → Nouvelle valeur
  - Utilisateur + date + IP
- [ ] Afficher dans fiche PAP sous onglet
- [ ] API `/api/historique/:entity_type/:entity_id`

---

## Phase 3 (3-4 jours) RÉCLAMATIONS & EXPORT

### Réclamations (MGP — Mécanisme Gestion Plaintes)
- [ ] Page `/reclamations` — Liste
  - [ ] Tableau réclamations (REC-code, PAP, objet, date, statut)
  - [ ] Filtres par statut
  - [ ] Actions (voir détail, répondre, escalader)
- [ ] Page `/reclamation/:code` — Détail
  - [ ] Identité PAP + bien concerné
  - [ ] Objet + description
  - [ ] Pièces jointes
  - [ ] Historique traitement
  - [ ] Formulaire réponse
  - [ ] Escalade (checkbox)
- [ ] Workflow statuts:
  - Reçue → En analyse → Recevable → En traitement → Réponse envoyée → Clôturée
  - Ou: Irrecevable (raccourci)
- [ ] SLA 30 jours (alerte rouge si dépassé)
- [ ] API `/api/reclamations/create`
- [ ] API `/api/reclamations/list`
- [ ] API `/api/reclamations/:id` (GET/PUT)
- [ ] API `/api/reclamations/:id/repondre` (POST)

### Conciliation
- [ ] Page `/conciliation` — PV conciliation
  - [ ] Lister PAP en conciliation
  - [ ] Créer PV (date, montant proposé, accord/refus)
  - [ ] Upload signature PAP + APIX
  - [ ] Historique conciliations par PAP
- [ ] API `/api/pap/:id/concilier` (POST)
- [ ] Génération PDF PV auto

### Audit Trail Complet
- [ ] Page `/audit` — Historique global
  - [ ] Filtres (utilisateur, table, action, date)
  - [ ] Tableau modifications
  - [ ] Détail avant/après
  - [ ] Export audit trail
- [ ] API `/api/historique/list` (filtré)

### Gestion Utilisateurs
- [ ] Page `/utilisateurs` (admin only)
  - [ ] Tableau utilisateurs
  - [ ] Créer compte (email + rôle)
  - [ ] Désactiver/réactiver
  - [ ] Changer rôle
  - [ ] Dernière connexion
- [ ] API `/api/utilisateurs/create`
- [ ] API `/api/utilisateurs/:id/role` (PUT)
- [ ] Envoi invitation email (Resend)

### Export & Rapports
- [ ] Fonction export Excel (xlsx)
  - [ ] Export tous PAP (données + montants)
  - [ ] Export paiements (mode, date, status)
  - [ ] Export réclamations (objet, statut, réponse)
  - [ ] Export audit trail
- [ ] Fonction export PDF
  - [ ] Rapport tableau de bord
  - [ ] Rapport par PAP (fiche complète)
  - [ ] PV conciliation
  - [ ] PV mise à disposition
- [ ] API `/api/exports/excel`
- [ ] API `/api/exports/pdf/:type`
- [ ] Lib: `lib/exports.js`

### Portail Citoyen Public
- [ ] Route `/public/suivi/:code_pap/:last4phone` (sans auth)
  - [ ] Afficher: statut, montant validé, montant payé
  - [ ] Timeline étapes
  - [ ] Contact support
  - [ ] Dépôt réclamation (formulaire)
- [ ] API `/api/public/pap/suivi/:code` (données publiques)
- [ ] API `/api/public/reclamation/depot` (POST anonyme)

### Paramètres Admin
- [ ] Page `/settings` (admin only)
  - [ ] Barèmes évaluation (FCFA/m² par type bien)
  - [ ] SLA réclamations (jours)
  - [ ] Mode paiement (ajouter/activer)
  - [ ] Projets (créer, éditer)
- [ ] API `/api/settings/bareme` (GET/PUT)
- [ ] API `/api/settings/sla` (GET/PUT)

---

## Tâches Transversales (Toutes phases)

### Sécurité
- [ ] SQL injection prevention (parameterized queries) ✅
- [ ] XSS prevention (DomSanitizer)
- [ ] CSRF protection (tokens)
- [ ] Rate limiting API
- [ ] Validation input client + serveur
- [ ] Authentification JWT + refresh token

### Performance
- [ ] Lazy load pages (React.lazy + Suspense) ✅
- [ ] Code splitting Vite ✅
- [ ] Optimiser images (WebP)
- [ ] Pagination tables (50 par page)
- [ ] Index DB pour recherche
- [ ] Cache KPIs (5 min)

### Testing
- [ ] Unit tests (vitest)
- [ ] Integration tests (API)
- [ ] E2E tests (cypress)
- [ ] Test fiabilisation logic

### Documentation
- [ ] README ✅
- [ ] PHASES.md ✅
- [ ] Architecture diagram
- [ ] API documentation (OpenAPI)
- [ ] User guide PAP

---

## Timeline Estimée

| Phase | Durée | Statut |
|-------|-------|--------|
| Phase 1 (Fondations) | 3-4 j | ✅ EN COURS |
| Phase 2 (Cœur métier) | 5-7 j | ⏳ À démarrer |
| Phase 3 (Réclamations) | 3-4 j | ⏳ À démarrer |
| Testing + Polish | 2-3 j | ⏳ À démarrer |
| **TOTAL** | **13-18 j** | |

---

## Priorités Phase 2 (première semaine)

1. **Lundi**: Registre PAP + API CRUD
2. **Mardi-Mercredi**: Fiche PAP + Nouveau PAP wizard
3. **Jeudi**: Biens + Évaluations
4. **Vendredi**: Paiements + Documents + Fiabilisation
5. **Weekend**: Tests + Bugs

Appel tous les jours 18h pour blocages.

---

## Blockers Connus

- [ ] Fichier Excel PAP existant (pour import)
- [ ] Barèmes évaluation APIX (par type bien)
- [ ] Configurations mode paiement (Wave, OM)
- [ ] Modèle email notifications
- [ ] Logo/branding officiel APIX

---

Next: **Démarrer Phase 2 — Registre PAP** 🚀
