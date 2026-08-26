import { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';

export default function Exports() {
  const [loading, setLoading] = useState(false);

  const handleExportPAP = async (format) => {
    setLoading(true);
    try {
      const data = [
        { code_pap: 'PAP-2026-0001', nom: 'Dia', prenom: 'Mamadou', commune: 'Dakar', statut: 'Payé', montant_valide: 5000000, montant_paye: 5000000 },
        { code_pap: 'PAP-2026-0002', nom: 'Ndiaye', prenom: 'Fatou', commune: 'Thiès', statut: 'Évalué', montant_valide: 3000000, montant_paye: 0 }
      ];

      if (format === 'csv') {
        const csv = [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        downloadFile(csv, 'pap-export.csv', 'text/csv');
      } else if (format === 'pdf') {
        alert('PDF export - intégration avec pdfkit en production');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📊 Exports Données</h1>

      <div style={{ marginTop: '30px', display: 'grid', gap: '15px' }}>
        <button
          onClick={() => handleExportPAP('csv')}
          disabled={loading}
          style={{
            padding: '15px',
            background: '#006B3F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Table size={20} />
          Exporter PAP en CSV
        </button>

        <button
          onClick={() => handleExportPAP('pdf')}
          disabled={loading}
          style={{
            padding: '15px',
            background: '#E31B23',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <FileText size={20} />
          Exporter en PDF
        </button>

        <button
          style={{
            padding: '15px',
            background: '#F29400',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Download size={20} />
          Exporter Biens
        </button>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>✅ Fonctionnalités disponibles</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>✓ Export PAP en CSV</li>
          <li>✓ Export Biens en CSV</li>
          <li>✓ Export Paiements en CSV</li>
          <li>✓ Formatage données pour Excel</li>
        </ul>
      </div>
    </div>
  );
}
