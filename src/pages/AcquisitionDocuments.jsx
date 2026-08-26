import React, { useState, useRef } from 'react';
import { Camera, Upload, FileText, CheckCircle, AlertCircle, Download, Zap } from 'lucide-react';

export default function AcquisitionDocuments() {
  const [mode, setMode] = useState('upload'); // 'camera' ou 'upload'
  const [documentType, setDocumentType] = useState('cni');
  const [documents, setDocuments] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [quality, setQuality] = useState({
    resolution: 0,
    lighting: 0,
    clarity: 0,
    tilt: 0
  });

  const documentTypes = [
    { value: 'cni', label: '🆔 Carte Nationale Identité', fields: ['nom', 'prenom', 'date_naissance', 'numero', 'date_emission', 'date_expiration'] },
    { value: 'passport', label: '🛂 Passeport', fields: ['nom', 'prenom', 'nationalite', 'numero', 'date_emission'] },
    { value: 'titre_propriete', label: '📜 Titre de Propriété', fields: ['numero_parcelle', 'proprietaire', 'superficie', 'adresse', 'date_acquisition'] },
    { value: 'bail', label: '📋 Bail/Contrat Location', fields: ['locataire', 'bailleur', 'adresse', 'montant_loyer', 'date_debut'] },
    { value: 'attestation', label: '✅ Attestation Résidence', fields: ['nom', 'adresse', 'date_emission', 'delivrant'] },
    { value: 'facture', label: '💰 Facture/Quittance', fields: ['numero', 'date', 'montant', 'beneficiaire', 'motif'] },
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1440 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('❌ Erreur accès caméra: ' + err.message);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.95);
      analyzeQuality(imageData);
      processDocument(imageData);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result;
        analyzeQuality(imageData);
        processDocument(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeQuality = (imageData) => {
    // Analyse simplifiée (dans prod: utiliser WebGL ou ML)
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Résolution (pixels > 2M = bon)
      const resolution = Math.min(100, Math.round((img.width * img.height) / 20000));

      // Luminosité moyenne
      let luminosity = 0;
      for (let i = 0; i < data.length; i += 4) {
        luminosity += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      luminosity = luminosity / (data.length / 4);
      const lighting = Math.min(100, 100 - Math.abs(luminosity - 128) * 1.5);

      // Contraste/netteté
      const contrast = calculateContrast(data);
      const clarity = Math.min(100, contrast * 2);

      setQuality({
        resolution,
        lighting: Math.round(lighting),
        clarity: Math.round(clarity),
        tilt: 85 // Détection inclinaison (placeholder)
      });
    };
    img.src = imageData;
  };

  const calculateContrast = (data) => {
    let sumDiff = 0;
    for (let i = 0; i < data.length - 4; i += 4) {
      const diff = Math.abs((data[i] + data[i + 1] + data[i + 2]) - (data[i + 4] + data[i + 5] + data[i + 6]));
      sumDiff += diff;
    }
    return Math.min(100, sumDiff / (data.length / 4));
  };

  const processDocument = async (imageData) => {
    setProcessing(true);
    try {
      // Simulation OCR (dans prod: Google Vision API, Tesseract.js, ou AWS Textract)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockExtraction = {
        cni: {
          nom: 'DIA',
          prenom: 'Mamadou',
          date_naissance: '15.01.1985',
          numero: '0012345678901',
          date_emission: '10.06.2020',
          date_expiration: '09.06.2030',
          sexe: 'M',
          lieu_naissance: 'Dakar'
        },
        passport: {
          nom: 'NDIAYE',
          prenom: 'Fatou',
          nationalite: 'Sénégalaise',
          numero: 'S0123456789',
          date_emission: '20.03.2021',
          date_expiration: '19.03.2031'
        },
        titre_propriete: {
          numero_parcelle: 'RT-001-456',
          proprietaire: 'Dia Mamadou',
          superficie: '500 m²',
          adresse: 'Dakar Centre',
          date_acquisition: '15.05.2015',
          valeur_estimee: '12.5M FCFA'
        },
        bail: {
          locataire: 'Ba Mohamed',
          bailleur: 'Sall Aïssatou',
          adresse: 'Thiès',
          montant_loyer: '150.000 FCFA',
          date_debut: '01.01.2024',
          duree: '12 mois'
        },
        attestation: {
          nom: 'Fall Ousseynou',
          adresse: 'Kaolack',
          date_emission: '26.08.2026',
          delivrant: 'Mairie Kaolack'
        },
        facture: {
          numero: 'FAC-2026-0045',
          date: '20.08.2026',
          montant: '850.000 FCFA',
          beneficiaire: 'Ndiaye Assane',
          motif: 'Travaux rénovation'
        }
      };

      const extracted = mockExtraction[documentType] || {};
      setExtractedData(extracted);

      const docName = `${documentType}_${new Date().toISOString().slice(0, 10)}`;
      setDocuments([
        ...documents,
        {
          id: Date.now(),
          name: docName,
          type: documentType,
          date: new Date().toLocaleDateString('fr-FR'),
          quality: quality,
          data: extracted,
          image: imageData
        }
      ]);

      setProcessing(false);
    } catch (error) {
      console.error('Erreur OCR:', error);
      setProcessing(false);
    }
  };

  const exportDocument = (doc) => {
    const json = JSON.stringify(doc.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name}.json`;
    a.click();
  };

  const getQualityColor = (value) => {
    if (value >= 80) return '#4caf50';
    if (value >= 60) return '#ff9800';
    return '#f44336';
  };

  const qualityScore = Math.round((quality.resolution + quality.lighting + quality.clarity + quality.tilt) / 4);
  const isGoodQuality = qualityScore >= 75;

  return (
    <div className="page-container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Zap size={28} color="#006B3F" />
        Acquisition Documents OCR Premium
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Scanner */}
        <div>
          {/* Mode sélection */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => { setMode('camera'); startCamera(); }}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: mode === 'camera' ? '#006B3F' : '#f5f5f5',
                  color: mode === 'camera' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Camera size={18} /> Caméra
              </button>
              <button
                onClick={() => setMode('upload')}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: mode === 'upload' ? '#006B3F' : '#f5f5f5',
                  color: mode === 'upload' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Upload size={18} /> Fichier
              </button>
            </div>

            {/* Sélection type document */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem' }}>
                📄 Type de Document
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {documentTypes.map(dt => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>

            {/* Caméra */}
            {mode === 'camera' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    background: '#000',
                    display: videoRef.current?.srcObject ? 'block' : 'none'
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button
                  onClick={capturePhoto}
                  disabled={processing}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: processing ? '#ccc' : '#006B3F',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  {processing ? '⏳ Traitement OCR...' : '📸 Capturer'}
                </button>
              </div>
            )}

            {/* Upload fichier */}
            {mode === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '2rem',
                  border: '2px dashed #006B3F',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#f0f8f5',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>📁</div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Glissez-déposez ou cliquez</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  PNG, JPG, PDF • Max 10MB • Résolution ≥ 2000px
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          {/* Documents traités */}
          {documents.length > 0 && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#006B3F' }}>📚 Documents Capturés ({documents.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{
                    background: '#f9f9f9',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${doc.quality.resolution >= 80 ? '#4caf50' : '#ff9800'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{doc.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{doc.date}</div>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#d4edda',
                        color: '#155724',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        ✓ Extrait
                      </span>
                    </div>

                    {/* Données extraites */}
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '13px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        {Object.entries(doc.data).map(([key, value]) => (
                          <div key={key} style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                            <div style={{ fontSize: '11px', color: '#666', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '600' }}>
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div style={{ fontWeight: '600', color: '#006B3F' }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Qualité */}
                    <div style={{ fontSize: '12px', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600' }}>
                        <span>Score Qualité</span>
                        <span style={{ color: getQualityColor(doc.quality.resolution) }}>
                          {Math.round((doc.quality.resolution + doc.quality.lighting + doc.quality.clarity + doc.quality.tilt) / 4)}%
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                        {['resolution', 'lighting', 'clarity', 'tilt'].map(metric => (
                          <div key={metric} style={{
                            background: '#f5f5f5',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '10px', color: '#666' }}>{metric}</div>
                            <div style={{ fontWeight: '600', color: getQualityColor(doc.quality[metric]) }}>
                              {doc.quality[metric]}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => exportDocument(doc)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: '#006B3F',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Download size={14} /> Exporter JSON
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panneau latéral */}
        <div>
          {/* Qualité scan en temps réel */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#006B3F', fontSize: '14px', fontWeight: '600' }}>
              🎯 Qualité Capture
            </h3>

            <div style={{
              padding: '1.5rem',
              background: isGoodQuality ? '#f0f8f5' : '#fff3cd',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: getQualityColor(qualityScore),
                marginBottom: '0.5rem'
              }}>
                {qualityScore}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {isGoodQuality ? '✅ Excellente qualité' : '⚠️ Améliorer la qualité'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '12px' }}>
              {[
                { label: 'Résolution', value: quality.resolution, icon: '📐' },
                { label: 'Luminosité', value: quality.lighting, icon: '💡' },
                { label: 'Netteté', value: quality.clarity, icon: '🔍' },
                { label: 'Angle', value: quality.tilt, icon: '📐' }
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: '600' }}>
                    <span>{item.icon} {item.label}</span>
                    <span style={{ color: getQualityColor(item.value) }}>{item.value}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: '#e0e0e0',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${item.value}%`,
                      background: getQualityColor(item.value),
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conseils */}
          <div style={{ background: '#f0f8f5', padding: '1.5rem', borderRadius: '12px', border: '1px solid #4caf50' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '13px', fontWeight: '600', color: '#2e7d32' }}>
              💡 Conseils Capture
            </h4>
            <ul style={{ fontSize: '12px', lineHeight: '1.8', color: '#2e7d32', paddingLeft: '1.2rem' }}>
              <li>📸 Utiliser bon éclairage naturel</li>
              <li>📏 Document doit remplir l'écran</li>
              <li>⏸️ Pas de reflet ou ombre</li>
              <li>🔄 Angle 0° (pas incliné)</li>
              <li>✂️ Tous les coins visibles</li>
              <li>🎨 Contraste élevé</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
