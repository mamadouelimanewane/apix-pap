# 🚀 APIX-PAP — Démarrage Rapide

**Version**: 1.0 (Phase 1 — Fondations)  
**Langue**: Français  
**Plateforme**: Windows / Mac / Linux  

---

## 📋 Prérequis

- **Node.js 18+** (npm)
- **PostgreSQL** (ou Neon PostgreSQL en ligne)
- **Git**
- **Code Editor** (VS Code recommandé)

### Vérifier l'installation
```bash
node --version        # v18+
npm --version         # v8+
git --version         # v2+
```

---

## 🎯 Installation en 5 Minutes

### 1️⃣ Cloner/Naviger vers le dossier
```bash
cd c:/gravity/apix-pap
```

### 2️⃣ Installer les dépendances
```bash
npm install
# ✅ 94 packages installés (~2 min)
```

### 3️⃣ Configuration Base de Données

**Créer un compte Neon gratuit** (PostgreSQL managé):
1. Aller sur https://console.neon.tech/
2. S'inscrire (email + password)
3. Créer un projet
4. Copier la connection string: `postgresql://...`

**Créer fichier `.env.local`**:
```bash
cp .env.example .env.local
```

**Éditer `.env.local`** (remplir DATABASE_URL):
```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/apix_pap?sslmode=require"
JWT_SECRET="votre_clé_secrète"
```

### 4️⃣ Initialiser la Base de Données
```bash
npm run db:init    # Crée 11 tables + indices
npm run db:seed    # Charge 5 PAP de démonstration
```

### 5️⃣ Démarrer en Développement
```bash
npm run dev
# ✅ Ouvre http://localhost:5173
```

---

## 🔑 Accès Demo

| Champ | Valeur |
|-------|--------|
| Email | `admin@apix.sn` |
| Mot de passe | `password` |
| Rôle | Admin (accès complet) |

### Autres utilisateurs de test
- `chef@apix.sn` — Chef de Projet
- `terrain@apix.sn` — Agent Terrain
- `social@apix.sn` — Agent Social
- `finance@apix.sn` — Agent Financier
- `juridique@apix.sn` — Responsable Juridique

Tous avec password: `password`

---

## 📊 Pages Disponibles

### Actuellement Opérationnelles
- ✅ `/login` — Page de connexion
- ✅ `/` (Dashboard) — Tableau de bord KPIs

### Phase 2 (À développer)
- ⏳ `/registre` — Liste PAP
- ⏳ `/pap/:code_pap` — Fiche PAP détaillée
- ⏳ `/nouveau-pap` — Créer une PAP (wizard)
- ⏳ `/biens` — Gestion biens
- ⏳ `/evaluations` — Évaluations montants
- ⏳ `/paiements` — Gestion paiements
- ⏳ `/documents` — Galerie documents

### Phase 3 (À développer)
- ⏳ `/reclamations` — Réclamations (MGP)
- ⏳ `/conciliation` — PV conciliation
- ⏳ `/audit` — Audit trail
- ⏳ `/utilisateurs` — Gestion users (admin)

---

## 🛠️ Commandes Principales

```bash
# Développement
npm run dev                # Démarre serveur avec hot reload

# Production
npm run build              # Build optimisé pour production
npm run preview            # Teste le build en local

# Base de Données
npm run db:init           # Créer schema + tables
npm run db:seed           # Charger données test (5 PAP)
npm run db:import-excel   # Importer PAP depuis Excel
                          # npm run db:import-excel -- --file=data/pap.xlsx

# Scripts utiles
npm run analyze           # Analyser taille bundle
npm install               # Installer/mettre à jour dépendances
npm audit fix            # Corriger vulnérabilités
```

---

## 🏗️ Structure du Projet

```
apix-pap/
├── src/                   # Code source React
│   ├── App.jsx           # Routes + protections
│   ├── main.jsx          # Point d'entrée
│   ├── index.css         # Design system (couleurs, typo)
│   ├── context/
│   │   └── AuthContext   # Gestion auth + rôles
│   ├── components/
│   │   └── Layout.jsx    # Sidebar + menu
│   └── pages/
│       ├── Login.jsx     # Connexion
│       └── Dashboard.jsx # KPIs
├── api/                   # API Vercel (vide pour l'instant)
├── lib/                   # Logique métier
│   ├── db.js             # Connexion PostgreSQL
│   └── fiabilisation.js  # Détection anomalies
├── scripts/               # Automation
│   ├── init-db.js        # Créer schema
│   ├── seed-data.js      # Données test
│   └── import-excel.js   # Importer Excel
├── dist/                  # Build production (npm run build)
├── node_modules/         # Dépendances (npm install)
├── .env.local            # ⚠️ NE PAS commiter
├── .env.example          # Template config
├── README.md             # Guide complet
├── PHASES.md             # Roadmap Phase 2-3
├── LAUNCH_REPORT.md      # Rapport Phase 1
├── DEMARRAGE_RAPIDE.md   # Ceci
├── package.json          # Dépendances + scripts
├── vite.config.js        # Build Vite
└── tsconfig.json         # TypeScript config
```

---

## 🎨 Design System

### Couleurs APIX
```css
--primary: #006B3F          /* Vert foncé (sidebar) */
--primary-light: #009639    /* Vert clair */
--accent: #F29400           /* Or (accents) */
--danger: #E31B23           /* Rouge (alertes) */
--warning: #FCD116          /* Jaune (attention) */
```

### Utilisation
```jsx
// Bouton
<button style={{ background: 'var(--primary)', color: 'white' }}>
  Cliquez-moi
</button>

// Texte danger
<p style={{ color: 'var(--danger)' }}>Erreur!</p>

// Badge
<span className="badge badge-anomaly">Anomalie</span>
```

---

## 🟢🟠🔴 Fiabilisation Automatique

Le système détecte automatiquement 10+ types d'anomalies:

| Anomalie | Description | Exemple |
|----------|-------------|---------|
| 🔴 SANS_CNI | Pas de pièce d'identité | ⚠️ Critique |
| 🔴 DOUBLON_TEL | Téléphone identique à autre PAP | À fusionner |
| 🔴 SANS_BIEN | Aucun bien déclaré | À ajouter |
| 🟠 SANS_EVALUATION | Aucun montant | À évaluer |
| 🟠 INCOHERENCE_PRIX | Prix/m² anormal | Vérifier |
| 🟠 PAYE_STATUT_ERRONE | Payé mais statut erroné | À corriger |
| 🟠 MANQUE_DOCUMENT | Doc. obligatoire absent | À uploader |

**Score** = 100 - (anomalies × 5)
- 🟢 **Complet** (90-100): Dossier prêt
- 🟠 **Incomplet** (50-89): À compléter
- 🔴 **Anomalies** (< 50): À corriger

---

## 📱 Responsive Design

L'app fonctionne sur:
- ✅ Desktop (1280px+)
- ✅ Tablet (768px-1279px)
- ✅ Mobile (< 768px) — sidebar réduite

**Tester responsive**:
```bash
# F12 → DevTools
# Ctrl+Shift+M (ou Cmd+Shift+M sur Mac)
# Choisir "Tablet" ou "Mobile"
```

---

## 🔐 Sécurité

### Secrets à Protéger
- ❌ Ne **JAMAIS** commiter `.env.local`
- ✅ Utiliser `.env.example` comme template
- ✅ Stocker secrets sur Vercel (Project Settings → Environment Variables)

### Vérifier Secrets
```bash
# Vérifier aucun secret commité
git log -S "pplx-" --oneline        # API Perplexity
git log -S "postgresql://" --oneline # Database
```

---

## 🐛 Troubleshooting

### Port 5173 déjà utilisé
```bash
# Tuer le processus
npx kill-port 5173

# Ou spécifier autre port
npm run dev -- --port 3000
```

### Erreur Database Connection
```bash
# Vérifier DATABASE_URL
cat .env.local | grep DATABASE_URL

# Vérifier Neon credentials
# 1. Aller sur https://console.neon.tech/
# 2. Copier connection string correctement
# 3. Essayer de se connecter avec psql:
#    psql "postgresql://..."
```

### Module non trouvé
```bash
# Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Rebuild TypeScript
npx tsc --noEmit

# Vérifier tsconfig.json
cat tsconfig.json
```

---

## 🧪 Tester les Fonctionnalités

### Test 1: Authentification
1. Aller à http://localhost:5173/login
2. Entrer: `admin@apix.sn` / `password`
3. ✅ Redirect vers Dashboard
4. ✅ Affichage nom + rôle en sidebar

### Test 2: Navigation
1. Cliquer sur "Tableau de Bord" (sidebar)
2. ✅ Voir les 6 KPIs
3. ✅ Graphiques Recharts visibles
4. ✅ Données de test affichées

### Test 3: Déconnexion
1. Sidebar → bouton "Déconnexion"
2. ✅ Redirect vers login
3. ✅ Token supprimé (localStorage clear)

### Test 4: Fiabilisation
(Phase 2) Créer une PAP → Cliquer badge 🟢🟠🔴 → Voir anomalies

---

## 📈 Monitoring Performance

### Bundle Size
```bash
npm run build
# Regarder output:
# dist/assets/index-*.js → 13.81 KB (excellent!)
# dist/assets/react-vendor-*.js → 221 KB (lazy-loaded)
# dist/assets/charts-*.js → 422 KB (lazy-loaded)
```

### Page Load Performance
```bash
# Chrome DevTools → Lighthouse
# F12 → Lighthouse → Generate Report
# Cible: LCP < 2.5s, FID < 100ms, CLS < 0.1
```

### Database Query Performance
```bash
# Vérifier indices
SELECT indexname FROM pg_indexes WHERE tablename='pap';

# Query explain
EXPLAIN ANALYZE SELECT * FROM pap WHERE code_pap = 'PAP-2026-0001';
```

---

## 🚀 Déployer sur Vercel

### 1. Push vers GitHub
```bash
git remote add origin https://github.com/mamadouelimanewane/apix-pap.git
git push -u origin main
```

### 2. Connecter à Vercel
1. Aller sur https://vercel.com/import
2. Sélectionner repository GitHub
3. Ajouter environment variables (Settings):
   - `DATABASE_URL` = Neon connection string
   - `JWT_SECRET` = clé secrète
   - `RESEND_API_KEY` = clé Resend (optionnel)

### 3. Deploy
- Vercel détecte `package.json` + `vite.config.js`
- Build automatique (`npm run build`)
- Live sur `apix-pap.vercel.app`

---

## 📚 Documentation Complémentaire

- **README.md** — Guide complet du projet
- **PHASES.md** — Roadmap détaillée (Phase 2-3)
- **LAUNCH_REPORT.md** — Rapport Phase 1
- **lib/fiabilisation.js** — Logique détection anomalies
- **scripts/init-db.js** — Schema SQL complet

---

## ❓ FAQ

**Q: Comment ajouter une nouvelle page?**  
A: Créer `src/pages/MaPage.jsx` → Ajouter route dans `src/App.jsx` → Ajouter lien dans `src/components/Layout.jsx`

**Q: Où modifier les couleurs APIX?**  
A: Éditer variables CSS dans `src/index.css` (`:root { ... }`)

**Q: Comment importer des PAP existants depuis Excel?**  
A: 
```bash
npm run db:import-excel -- --file=data/mes_pap.xlsx --projet=GT-001
```
Voir `scripts/import-excel.js` pour format.

**Q: Puis-je utiliser SQLite au lieu de PostgreSQL?**  
A: Oui, mais il faudrait adapter `lib/db.js`. Recommandé: rester sur PostgreSQL pour scalabilité.

**Q: Qui contacter pour questions?**  
A: Consulter README.md section "Support" ou contacter directement l'équipe.

---

## 🎓 Prochaines Étapes

**Après démarrage:**
1. ✅ Vérifier tout fonctionne en local
2. ✅ Tester données de démo (5 PAP)
3. ⏳ Préparer fichier Excel existant pour import
4. ⏳ Configurer barèmes évaluation (admin)
5. ⏳ Commencer Phase 2 (Registre PAP)

---

**Support 24/7**: Pour blocages, contactez `admin@apix.sn`

**Dernière mise à jour**: 25/08/2026  
**Version Stable**: 1.0  
**Node.js Minimum**: 18.x  
**NPM Minimum**: 8.x

