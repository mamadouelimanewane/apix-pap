import { useState } from 'react';
import { Search as SearchIcon, Users, FileText, DollarSign, AlertCircle } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const allData = [
    { id: 1, type: 'PAP', title: 'PAP-2026-0001', subtitle: 'Dia Mamadou', text: 'Dakar' },
    { id: 2, type: 'PAP', title: 'PAP-2026-0002', subtitle: 'Ndiaye Fatou', text: 'Thiès' },
    { id: 3, type: 'Bien', title: 'BIEN-2026-0001', subtitle: 'Terrain', text: '500 m²' },
    { id: 4, type: 'Paiement', title: 'PAY-2026-0001', subtitle: '5 000 000 FCFA', text: 'Virement' },
    { id: 5, type: 'Réclamation', title: 'REC-2026-0001', subtitle: 'Doublon téléphone', text: 'Ouvert' }
  ];

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setQuery(value);

    if (value.trim()) {
      const filtered = allData.filter(item =>
        item.title.toLowerCase().includes(value) ||
        item.subtitle.toLowerCase().includes(value) ||
        item.text.toLowerCase().includes(value)
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'PAP': return <Users size={20} style={{ color: '#006B3F' }} />;
      case 'Bien': return <FileText size={20} style={{ color: '#F29400' }} />;
      case 'Paiement': return <DollarSign size={20} style={{ color: '#006B3F' }} />;
      case 'Réclamation': return <AlertCircle size={20} style={{ color: '#E31B23' }} />;
      default: return <SearchIcon size={20} />;
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🔍 Recherche Globale</h1>

      <div style={{ position: 'relative', marginBottom: '30px' }}>
        <SearchIcon size={20} style={{
          position: 'absolute',
          left: '15px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#999'
        }} />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Rechercher PAP, Biens, Paiements, Réclamations..."
          style={{
            width: '100%',
            padding: '15px 15px 15px 45px',
            fontSize: '16px',
            border: '2px solid #006B3F',
            borderRadius: '8px',
            outline: 'none'
          }}
        />
      </div>

      {results.length > 0 && (
        <div>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  ':hover': { background: '#f5f5f5' }
                }}
              >
                {getIcon(item.type)}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>{item.title}</h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {item.subtitle} • {item.text}
                  </p>
                </div>
                <span style={{
                  padding: '5px 10px',
                  background: '#f0f0f0',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {query && results.length === 0 && (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          Aucun résultat pour "{query}"
        </div>
      )}

      {!query && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          Tapez pour rechercher dans tous les dossiers
        </div>
      )}
    </div>
  );
}
