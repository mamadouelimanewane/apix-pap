# 🚀 DÉPLOIEMENT RENDER - GUIDE FINAL

**Status:** ✅ Backend code PRÊT  
**Files:** 3 files backend créés + scripts  
**Time:** 30 min deployment + 30 min testing

---

## 📋 ÉTAPE 1: Adapter server.js (10 min)

**Fichier:** `backend/server.js`

Ajouter après les imports:

```javascript
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const importRoutes = require('./routes/import');
const { Project, CategorySchema } = require('./models');

// ============================================================================
// MONGODB CONNECTION
// ============================================================================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apix_pap', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Error:', err.message);
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Disconnected');
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 },
  safeFileNames: true,
  preserveExtension: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================================================
// ROUTES
// ============================================================================

// Import routes
app.use('/api/projects', importRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`   Backend: http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/health\n`);
});
```

---

## 📋 ÉTAPE 2: Installer les dépendances (5 min)

```bash
cd backend
npm install --save mongoose express-fileupload xlsx
npm install  # Install all deps
```

Vérifier `package.json` contient:
```json
{
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^7.x",
    "express-fileupload": "^1.x",
    "xlsx": "^0.x",
    "dotenv": "^16.x"
  }
}
```

---

## 📋 ÉTAPE 3: Configuration Render (5 min)

### 3.1 Environment Variables

Render Dashboard → Settings → Environment Variables

```
NODE_ENV=production
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/apix_pap?retryWrites=true&w=majority

# JWT (existant)
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# CORS (optionnel)
CORS_ORIGIN=https://apix-pap.vercel.app
```

### 3.2 Build & Start Commands

**Build:** `npm install`
**Start:** `npm start` (or `node backend/server.js`)

### 3.3 Health Check

- Path: `/health`
- Port: 5000
- Interval: 30s
- Timeout: 10s

---

## 📋 ÉTAPE 4: Déployer sur Render (5-10 min)

1. Commit tout le code
   ```bash
   git push origin main
   ```

2. Aller à https://dashboard.render.com

3. Créer Web Service:
   - Connect GitHub repo
   - Branch: `main`
   - Build: `npm install`
   - Start: `npm start`
   - Plan: Standard

4. Ajouter Environment Variables

5. Deploy → Attendre 2-3 minutes

6. Vérifier Health:
   ```
   GET https://apix-pap-backend.onrender.com/health
   ```

---

## 📋 ÉTAPE 5: Initialiser TER Project (10 min)

### Option 1: Via Render One-Off Command

Dashboard Render → "Shell":
```bash
node backend/scripts/init-ter-project.js
```

### Option 2: Via Render Deploy Hook

Ajouter à `render.yaml`:
```yaml
preDeployCommand: "node backend/scripts/init-ter-project.js"
```

### Verification

```bash
# Vérifier dans MongoDB Atlas
db.projects.findOne({ projectCode: "TER" })
# Should return project document

db.categorySchemas.findOne({ categoryName: "EXPLOITANT PA" })
# Should return schema document
```

---

## 🧪 ÉTAPE 6: Test Import TER (15-20 min)

### 6.1 Détecter Schéma

```bash
curl -X POST https://apix-pap-backend.onrender.com/api/projects/TER/detect-schema \
  -F "file=@BDD_TC_APIX_29032022 VF.xlsx" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response attendu:**
```json
{
  "success": true,
  "fileInfo": {
    "totalRows": 35,
    "totalColumns": 59
  },
  "categories": {
    "EXPLOITANT PA": {
      "count": 34,
      "columns": [...]
    }
  }
}
```

### 6.2 Importer Données

```bash
curl -X POST https://apix-pap-backend.onrender.com/api/projects/TER/import \
  -F "file=@BDD_TC_APIX_29032022 VF.xlsx" \
  -F 'categoryMapping={"EXPLOITANT PA": "EXPLOITANT PA"}' \
  -F 'columnMapping={}' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response attendu:**
```json
{
  "success": true,
  "message": "34/35 bénéficiaires importés",
  "stats": {
    "totalCreated": 34,
    "totalFailed": 1,
    "successRate": "97%"
  }
}
```

### 6.3 Vérifier MongoDB

```bash
# Vérifier beneficiaries créés
db.beneficiaries.find({ projectId: ObjectId("...") }).count()
# Should return: 34

# Vérifier ImportBatch
db.importBatches.findOne()
```

---

## ✅ CHECKLIST DÉPLOIEMENT

```
PRÉ-DÉPLOIEMENT:
[x] backend/models/index.js créé
[x] backend/routes/import.js créé
[x] backend/scripts/init-ter-project.js créé
[x] server.js adapté
[x] package.json dependencies OK

DÉPLOIEMENT RENDER:
[ ] Git push vers main
[ ] Render environment variables configurées
[ ] Build command: npm install
[ ] Start command: npm start
[ ] Deployment réussi (2-3 min)

POST-DÉPLOIEMENT:
[ ] /health endpoint répond
[ ] MongoDB connexion OK
[ ] TER Project initialisé
[ ] CategorySchema créé
[ ] Prêt pour import

TESTS:
[ ] Schema detection OK
[ ] Import 34 PAPs OK
[ ] Beneficiaries créées en DB
[ ] ImportBatch tracking OK
```

---

## 🔧 TROUBLESHOOTING

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
→ Vérifier MONGODB_URI correcte
→ Vérifier Render IP whitelisted dans Atlas
→ Vérifier credentials correctes
```

### File Upload Error
```
Error: File too large
→ Augmenter MAX_FILE_SIZE dans environment
→ Vérifier file < 50MB
```

### Schema Not Found
```
Error: CategorySchema not found
→ Vérifier init-ter-project.js exécuté
→ Vérifier projectId correct
```

### CORS Error
```
Error: CORS policy
→ Vérifier CORS_ORIGIN configurée
→ Vérifier frontend URL dans CORS_ORIGIN
```

---

## 📊 URLS FINALES

| Service | URL |
|---------|-----|
| Frontend | https://apix-pap.vercel.app |
| Backend Health | https://apix-pap-backend.onrender.com/health |
| API Base | https://apix-pap-backend.onrender.com/api |
| Detect Schema | POST /api/projects/:projectId/detect-schema |
| Import | POST /api/projects/:projectId/import |
| List Imports | GET /api/import-batches |

---

## 🎯 NEXT STEPS

Après succès du déploiement:

1. **Frontend Adaptation** (2-4h)
   - Adapter ExcelImport.jsx pour nouvelles API
   - Ajouter Project selector
   - Tester import E2E

2. **Monitoring** (1h)
   - Setup Render logs monitoring
   - Setup MongoDB Atlas alerts
   - Configure error tracking

3. **Production Readiness** (30min)
   - Backups configured
   - Rollback plan ready
   - Documentation updated

---

**🚀 APIX-PAP Backend v2 - PRÊT POUR RENDER!**

Durée totale: 30-40 min deployment + 15-20 min testing = 1 heure

Besoin d'aide? Référence: `/health` endpoint ou logs Render Dashboard.
