import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const schema = `
-- Projets
CREATE TABLE IF NOT EXISTS projets (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  nom VARCHAR(200) NOT NULL,
  region VARCHAR(80),
  statut VARCHAR(30) DEFAULT 'Actif',
  date_debut DATE,
  date_fin_prevue DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(30) NOT NULL DEFAULT 'consultation',
  actif BOOLEAN DEFAULT TRUE,
  derniere_connexion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAP (Personnes Affectées par le Projet)
CREATE TABLE IF NOT EXISTS pap (
  id SERIAL PRIMARY KEY,
  code_pap VARCHAR(20) UNIQUE NOT NULL,
  projet_id INTEGER NOT NULL REFERENCES projets(id),

  -- Identité
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  sexe CHAR(1),
  date_naissance DATE,
  telephone VARCHAR(20),
  telephone2 VARCHAR(20),
  cni VARCHAR(30),

  -- Adresse
  region VARCHAR(80),
  departement VARCHAR(80),
  commune VARCHAR(80),
  quartier VARCHAR(80),
  adresse_detail TEXT,
  gps_lat DECIMAL(10,7),
  gps_lng DECIMAL(10,7),

  -- Données socio-économiques
  situation_matrimoniale VARCHAR(30),
  nb_dependants SMALLINT,
  niveau_scolarite VARCHAR(50),
  activite_principale VARCHAR(100),

  -- Workflow
  statut VARCHAR(30) NOT NULL DEFAULT 'Nouveau',
  fiabilisation VARCHAR(10) DEFAULT 'incomplet',
  anomalies JSONB,

  -- Audit
  cree_par INTEGER REFERENCES utilisateurs(id),
  cree_le TIMESTAMPTZ DEFAULT NOW(),
  mis_a_jour_le TIMESTAMPTZ DEFAULT NOW()
);

-- Biens
CREATE TABLE IF NOT EXISTS biens (
  id SERIAL PRIMARY KEY,
  code_bien VARCHAR(20) UNIQUE NOT NULL,
  pap_id INTEGER NOT NULL REFERENCES pap(id),
  type_bien VARCHAR(50) NOT NULL,
  nature_titre VARCHAR(50),
  localisation TEXT,
  superficie_m2 DECIMAL(12,2),
  gps_lat DECIMAL(10,7),
  gps_lng DECIMAL(10,7),
  description TEXT,
  statut VARCHAR(30) DEFAULT 'Recensé',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Évaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id SERIAL PRIMARY KEY,
  bien_id INTEGER NOT NULL REFERENCES biens(id),
  montant_initial BIGINT,
  montant_fiabilise BIGINT,
  montant_valide BIGINT,
  unite VARCHAR(20) DEFAULT 'FCFA',
  evaluateur VARCHAR(100),
  date_evaluation DATE,
  observations TEXT,
  valide_par INTEGER REFERENCES utilisateurs(id),
  valide_le TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paiements
CREATE TABLE IF NOT EXISTS paiements (
  id SERIAL PRIMARY KEY,
  code_paiement VARCHAR(20) UNIQUE NOT NULL,
  pap_id INTEGER NOT NULL REFERENCES pap(id),
  montant BIGINT NOT NULL,
  mode VARCHAR(30),
  reference VARCHAR(100),
  date_paiement DATE,
  statut VARCHAR(20) DEFAULT 'En attente',
  justificatif_url TEXT,
  effectue_par INTEGER REFERENCES utilisateurs(id),
  effectue_le TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Réclamations
CREATE TABLE IF NOT EXISTS reclamations (
  id SERIAL PRIMARY KEY,
  code_rec VARCHAR(20) UNIQUE NOT NULL,
  pap_id INTEGER NOT NULL REFERENCES pap(id),
  date_reception DATE,
  objet VARCHAR(200),
  description TEXT,
  responsable_id INTEGER REFERENCES utilisateurs(id),
  analyse TEXT,
  decision TEXT,
  date_reponse DATE,
  statut VARCHAR(30) DEFAULT 'Reçue',
  escalade BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  pap_id INTEGER REFERENCES pap(id),
  bien_id INTEGER REFERENCES biens(id),
  reclamation_id INTEGER REFERENCES reclamations(id),
  type_document VARCHAR(80),
  nom_fichier VARCHAR(255),
  url TEXT NOT NULL,
  taille_ko INTEGER,
  uploade_par INTEGER REFERENCES utilisateurs(id),
  uploade_le TIMESTAMPTZ DEFAULT NOW()
);

-- Historique/Audit Trail
CREATE TABLE IF NOT EXISTS historique (
  id SERIAL PRIMARY KEY,
  table_cible VARCHAR(50),
  enregistrement_id INTEGER,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  action VARCHAR(30),
  champ VARCHAR(100),
  ancienne_valeur TEXT,
  nouvelle_valeur TEXT,
  date_action TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45)
);

-- Créer des index pour performance
CREATE INDEX IF NOT EXISTS idx_pap_code ON pap(code_pap);
CREATE INDEX IF NOT EXISTS idx_pap_projet ON pap(projet_id);
CREATE INDEX IF NOT EXISTS idx_pap_statut ON pap(statut);
CREATE INDEX IF NOT EXISTS idx_biens_pap ON biens(pap_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_bien ON evaluations(bien_id);
CREATE INDEX IF NOT EXISTS idx_paiements_pap ON paiements(pap_id);
CREATE INDEX IF NOT EXISTS idx_reclamations_pap ON reclamations(pap_id);
`;

async function initDB() {
  try {
    console.log('Initialisation de la base de données...');
    await pool.query(schema);
    console.log('✅ Schema créé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur d\'initialisation:', error);
    process.exit(1);
  }
}

initDB();
