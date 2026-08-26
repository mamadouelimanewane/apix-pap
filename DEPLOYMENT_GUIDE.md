# 🚀 Guide Déploiement APIX-PAP sur Vercel

**Date:** 2026-08-26  
**Status:** ✅ Build réussi - Prêt pour production

---

## 📋 PRÉALABLES

- [ ] Compte Vercel actif (https://vercel.com)
- [ ] Git repository configuré
- [ ] GitHub / GitLab / Bitbucket connecté
- [ ] Variables d'environnement préparées

---

## 🔧 ÉTAPES DE DÉPLOIEMENT

### 1. Préparer l'environnement Vercel

```bash
# Vérifier la compilation locale
npm run build
# Résultat: ✓ built in 15.29s ✓

# Vérifier les assets générés
ls -la dist/
```

**Résultat attendu:**
```
dist/
├── index.html
├── assets/
│   ├── index-*.js        # Main app (233 kB)
│   ├── vendors-*.js      # Dependencies (50 kB)
│   ├── react-vendor-*.js # React (221 kB)
│   ├── charts-*.js       # Charts (422 kB)
│   └── ...
```

---

### 2. Configuration Vercel

**Fichier: `vercel.json`** (créer à la racine)

```json
{
  "projectName": "apix-pap",
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "regions": ["sfo1"],
  "env": {
    "VITE_APP_API_URL": "@VITE_APP_API_URL",
    "VITE_APP_ENV": "@VITE_APP_ENV"
  }
}
```

---

### 3. Variables d'environnement Vercel

Aller à **Project Settings > Environment Variables** et ajouter:

```
VITE_APP_API_URL  = https://api.apix-pap.com/api
VITE_APP_ENV      = production
VITE_APP_VERSION  = 1.0.1
REACT_APP_API_URL = https://api.apix-pap.com/api
```

---

### 4. Déployer avec Git (automatique)

**Option A: Branche principale (main/master)**

```bash
git add .
git commit -m "chore: deploy APIX-PAP v1.0.1 with 6 new features

- ✅ API Integration (ApiService.js)
- ✅ Drill-Down Pages (DrillDownPhases.jsx)
- ✅ Notifications (NotificationService.js)
- ✅ Mobile Optimization (MobileOptimization.js)
- ✅ DashboardMetierAPIP integration
- ✅ Tailwind + Lucide + Recharts

Production ready"

git push origin main
```

Vercel va automatiquement:
1. Détecter le push
2. Cloner le repo
3. Lancer `npm run build`
4. Déployer les assets dans `dist/`
5. Générer URL de production

---

### 5. Déployer avec Vercel CLI (manuel)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer production
vercel --prod

# Ou: déployer en preview
vercel
```

---

## 📊 APRÈS DÉPLOIEMENT

### Checklist post-déploiement

- [ ] Build succeeds: `✓ built in 15.29s`
- [ ] Site ouvert: https://apix-pap.vercel.app/
- [ ] Login page charge
- [ ] CSS/Tailwind appliqué
- [ ] API proxy fonctionne
- [ ] Notifications système démarre
- [ ] Mobile responsive OK
- [ ] Console sans errors

### Tests de validation

```bash
# Test 1: Page charge
curl -I https://apix-pap.vercel.app/

# Test 2: Assets chargent
curl -I https://apix-pap.vercel.app/assets/index-*.js

# Test 3: Console logs clean
# Ouvrir DevTools → Console → No errors
```

---

## 🔌 INTÉGRATION API

### Configuration pour production

**Backend API:** `https://api.apix-pap.com`

**Endpoints:**
```
/api/dashboard/metier-stats
/api/pap/list
/api/compensation/approve/{id}
/api/payment/confirm/{id}
/api/analytics/track
```

**Authentication:**
```javascript
// ApiService.js handles JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📈 MONITORING

### Vercel Analytics

Aller à **Project Settings > Analytics** pour voir:

- **Web Vitals:** LCP, FID, CLS
- **Response Time:** API latency
- **Build Time:** Temps de compilation
- **Deployment:** Historique des déploiements

### Logs en temps réel

```bash
vercel logs apix-pap --prod
```

---

## 🔄 MISE À JOUR FUTURE

### Workflow standard

```bash
# Développement local
npm run dev

# Test avant push
npm run build

# Commit et push
git add .
git commit -m "feat: add feature"
git push origin develop

# Pull request sur main
# → Vercel crée preview
# → Review et merge
# → Vercel déploie production
```

---

## 🆘 DÉPANNAGE

### Build échoue

```bash
# Nettoyer cache et node_modules
rm -rf node_modules dist
npm install
npm run build
```

### Site blanc (blank page)

1. Vérifier `index.html` existe
2. Vérifier `dist/index.html` pointe vers `/assets/`
3. Vérifier CORS pour API
4. Vérifier JWT token valide

### API non accessible

```javascript
// Vérifier ApiService
console.log('API Base URL:', BASE_URL);

// Vérifier token
console.log('JWT:', localStorage.getItem('jwtToken'));

// Test endpoint
fetch('/api/dashboard/metier-stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Notification system pas de démarrage

```javascript
// Vérifier dans App.jsx
useEffect(() => {
  if (user) {
    const notifications = getNotificationSystem();
    notifications.start();
    console.log('✅ Notification system started');
  }
}, [user]);
```

---

## 📊 RÉSUMÉ DÉPLOIEMENT

```
✅ Build        → dist/ (1.1 MB HTML, 7 JS bundles)
✅ Vercel       → Auto-deploy on main branch
✅ API          → Proxy /api → https://api.apix-pap.com
✅ Notifications → Auto-start au login
✅ Mobile       → Responsive CSS inclus
✅ Performance  → Code splitting activé

Status: 🟢 PRODUCTION READY
URL: https://apix-pap.vercel.app
```

---

## 🎯 PROCHAINES ÉTAPES

1. **Lancer build final** → `npm run build`
2. **Vérifier dist/** → Tous les assets
3. **Push to main** → `git push origin main`
4. **Attendre Vercel** → ~2 min pour déploiement
5. **Tester production** → Ouvrir apix-pap.vercel.app
6. **Monitor logs** → `vercel logs apix-pap --prod`
7. **Ajouter features avancées** → BI, rapports, etc.

