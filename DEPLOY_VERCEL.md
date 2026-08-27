# 🚀 Déployer APIX-PAP Frontend sur Vercel

**Temps estimé**: 5-10 minutes  
**Prérequis**: GitHub account + Vercel account

---

## 📋 Étape 1: Préparer le Backend

**IMPORTANT**: Déployer le backend d'abord!

### Option A: Railway.app (Recommandé)

```bash
# 1. Aller sur https://railway.app
# 2. Sign up / Login
# 3. New Project → GitHub
# 4. Select repository: apix-pap-backend
# 5. Railway détecte automatiquement Node.js
# 6. Add MongoDB plugin
# 7. Set environment variables:
#    - MONGODB_URI
#    - JWT_SECRET
#    - CORS_ORIGIN=https://your-vercel-url.vercel.app
# 8. Deploy

# Récupérer l'URL du backend:
# Example: https://apix-pap-backend.up.railway.app

BACKEND_URL="https://apix-pap-backend.up.railway.app/api"
```

### Option B: Render.com

```bash
# 1. Aller sur https://render.com
# 2. New Web Service → GitHub
# 3. Select repository: apix-pap-backend
# 4. Environment: Node
# 5. Build: npm install
# 6. Start: npm start
# 7. Add PostgreSQL/MongoDB
# 8. Set env vars
# 9. Deploy

BACKEND_URL="https://apix-pap-api.onrender.com/api"
```

---

## 🎯 Étape 2: Préparer Frontend pour Vercel

### 2.1: Vérifier package.json

```bash
cd C:\gravity\apix-pap

# Vérifier que "build" script existe
cat package.json | grep -A 5 '"scripts"'
```

**Doit contenir:**
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### 2.2: Vérifier .env.production

```bash
cat .env.production
```

**Doit contenir:**
```env
VITE_APP_API_URL=@vite_app_api_url
VITE_DEBUG=false
```

### 2.3: Vérifier vite.config.js

```bash
cat vite.config.js
```

**Doit avoir:**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000'
      }
    }
  }
})
```

---

## 🔗 Étape 3: Connecter GitHub

```bash
# Vérifier que le code est sur GitHub
git remote -v
# Doit montrer: origin https://github.com/YOUR_USERNAME/apix-pap

# Pousser le code (si pas déjà fait)
git push origin main
```

---

## 📦 Étape 4: Déployer sur Vercel

### 4.1: Importer Projet

1. Aller à: https://vercel.com/new
2. Cliquer "Import Git Repository"
3. Chercher "apix-pap"
4. Cliquer "Import"

### 4.2: Configurer Projet

**Framework Preset**: Vite  
**Build Command**: `npm run build`  
**Output Directory**: `dist`  
**Install Command**: `npm install`

### 4.3: Ajouter Variables d'Environnement

1. Cliquer "Environment Variables"
2. Ajouter:

```
Name: VITE_APP_API_URL
Value: https://apix-pap-backend.up.railway.app/api
```

```
Name: VITE_DEBUG
Value: false
```

3. Cliquer "Deploy"

### 4.4: Attendre le Build

```
✅ Building
✅ Linking source code
✅ Installing dependencies
✅ Building application
✅ Generating sitemap
✅ Done
```

---

## ✅ Vérifier le Déploiement

### 5.1: URL Vercel

Une fois déployé, vous recevrez une URL:
```
🎉 Deployment successful!
https://apix-pap.vercel.app
```

### 5.2: Tester l'Application

```bash
# 1. Ouvrir l'URL dans le navigateur
https://apix-pap.vercel.app

# 2. Vérifier que la page charge
# 3. Login: admin@apix.sn / password
# 4. Vérifier dans DevTools que l'API URL est correcte
#    Network tab → Check Authorization header
```

### 5.3: Vérifier les Connexions API

**DevTools → Network:**
```
✅ POST /api/auth/login → 200
✅ GET /api/pap/list → 200
✅ Authorization header présent
✅ Pas d'erreurs CORS
```

**Console:**
```
✅ Pas d'erreurs
✅ Pas de 404
✅ API connectée
```

---

## 🔄 Configuration du Déploiement Automatique

### Auto-Deploy sur Push

Vercel déploie automatiquement quand vous poussez sur `main`:

```bash
# Make changes
git add .
git commit -m "Fix bug"

# Push to GitHub
git push origin main

# ✅ Vercel auto-déploie
# Vérifier: https://vercel.com/dashboard
```

### Désactiver Auto-Deploy

1. Vercel Dashboard → Settings
2. Git → Deployments
3. Uncheck "Automatic deployments"

---

## 🌍 Custom Domain (Optionnel)

### Ajouter Domaine Personnalisé

1. Vercel Dashboard → Settings → Domains
2. Ajouter votre domaine
3. Suivre les instructions DNS
4. Vérifier: https://votre-domaine.com

**Exemple:**
```
Domain: apix-pap.sn
URL: https://apix-pap.sn
```

---

## 📊 Performance Optimization

### Analytics (Gratuit)

1. Vercel Dashboard → Analytics
2. Voir:
   - Page load times
   - Core Web Vitals
   - Traffic
   - Errors

### Edge Caching

Vercel cache automatiquement:
- Static assets (images, CSS, JS)
- API responses (si configuré)
- HTML pages (ISR)

---

## 🔐 Sécurité

### Variables d'Environnement

✅ JAMAIS commiter `.env.production`  
✅ TOUJOURS utiliser Vercel Dashboard  
✅ Rotation des secrets tous les 90 jours

### Headers de Sécurité

Vercel applique automatiquement:
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### HTTPS

✅ Automatique (tous les déploiements HTTPS)  
✅ Certificat SSL gratuit  
✅ Renouvellement automatique

---

## 📈 Scaling & Performance

### Serverless Functions

Si vous avez des API routes:
```
/api/health
/api/analytics
etc.
```

Vercel les exécute comme Serverless Functions.

### CDN Edge

Vercel distribute le contenu sur:
- 30+ régions globales
- ~100ms latency partout
- Compression automatique

### Monitoring

Voir les métriques:
1. Dashboard → Monitoring
2. Check:
   - Response times
   - Error rates
   - CPU usage
   - Memory usage

---

## 🆘 Dépannage

### Build Failed

**Erreur**: `npm run build` failed

```bash
# Vérifier localement
npm run build

# Si ça fonctionne localement, le problème est:
# 1. Node version différente
# 2. Variable d'env manquante
# 3. Chemin d'import incorrect
```

**Solution**:
1. Check Vercel Build logs
2. Vercel Dashboard → Deployments → Click failed build
3. See error message
4. Fix locally
5. Push to GitHub
6. Auto-redeploy

### Blanc Page

**Symptôme**: Page vide, pas d'erreur

**Causes possibles**:
- App.jsx not found
- Wrong import paths
- React version mismatch

**Solution**:
1. Check Console (F12)
2. Check Network tab
3. Verify imports in vite.config.js

### API Connection Error

**Symptôme**: Can't connect to backend

**Solution**:
1. Vercel Dashboard → Settings → Environment Variables
2. Verify VITE_APP_API_URL is set
3. Verify backend URL is accessible
4. Check CORS config in backend

```bash
# Test from browser console
fetch('https://your-backend-url/api/pap/list')
  .then(r => r.json())
  .then(data => console.log('Success:', data))
```

---

## ✨ Best Practices

### 1. Environment Variables

```
✅ Production secrets in Vercel Dashboard only
✅ Never commit .env files
✅ Use different values per environment
✅ Rotate secrets regularly
```

### 2. Git Workflow

```bash
# Development
git checkout -b feature/my-feature
git push origin feature/my-feature
# Create PR on GitHub

# After review
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main
# ✅ Vercel auto-deploys
```

### 3. Performance

```
✅ Images optimized (Vercel Image Optimization)
✅ Code splitting working
✅ No large bundles
✅ Cache headers set correctly
```

### 4. Monitoring

- Check Vercel Analytics daily
- Monitor error rates
- Track Core Web Vitals
- Set up alerts for failures

---

## 📚 Ressources

- **Vercel Docs**: https://vercel.com/docs
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html#vercel
- **Environment Variables**: https://vercel.com/docs/projects/environment-variables
- **Analytics**: https://vercel.com/docs/analytics

---

## 🎉 Résumé

| Étape | Action | Temps |
|-------|--------|-------|
| 1 | Deploy backend (Railway) | 5 min |
| 2 | Prepare frontend | 1 min |
| 3 | Connect GitHub | 1 min |
| 4 | Deploy to Vercel | 3 min |
| 5 | Test & verify | 2 min |
| **Total** | | **~12 min** |

---

## ✅ Deployment Checklist

- [ ] Backend deployed (Railway/Render)
- [ ] Backend URL copied
- [ ] GitHub repository created
- [ ] Code pushed to main branch
- [ ] Vercel account created
- [ ] Repository imported to Vercel
- [ ] VITE_APP_API_URL set to backend URL
- [ ] VITE_DEBUG set to false
- [ ] Build successful
- [ ] Domain verified (if custom domain)
- [ ] Analytics configured
- [ ] Monitoring alerts set
- [ ] Tested workflow end-to-end

---

## 🚀 Status

Frontend ready for Vercel deployment!

**Next**: Connect backend at deployment time

**Contact**: mamadouastelwane@gmail.com
