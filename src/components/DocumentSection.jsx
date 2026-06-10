import React, { useState, useEffect} from 'react';
import { documentService } from '../services/documentService'; // À créer

export default function DocumentSection({ projectId, documents, userRole, phase, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('BOM');

  const handleUpload = async (e) => {
  
    
    if (!file) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    try {
    
      await documentService.upload(projectId, file, type);
      
      alert("Document uploadé avec succès !");
      
      setFile(null); 
      if (onUploadSuccess) onUploadSuccess(); 
    } catch (error) {
      console.error("Erreur upload:", error);
      const msg = error.response?.data?.message || "Erreur lors de l'upload.";
      alert(msg);
    }
  };

  const getAvailableTypes = () => {
  if (userRole === 'INGENIEUR') return ['PV_RECETTE', 'EXPLOITATION'];
  if (userRole === 'PRESALES') return ['BOM', 'ARCHITECTURE'];
  return ['BOM', 'ARCHITECTURE', 'PV_RECETTE', 'EXPLOITATION'];
};

  const canUpload = (role, phase) => {
    if (phase === 'PRE_PROJET') return role === 'PRESALES';
    if (phase === 'POST_PROJET') return role === 'INGENIEUR';
    return false; 
  };
  useEffect(() => {
  const types = getAvailableTypes();
  if (!types.includes(type)) {
    setType(types[0]); 
  }
}, [userRole]);

 return (
    <div className="cis-card">
      <div className="cis-card-title">
        Documents du projet <span>{documents.length} fichiers</span>
      </div>
      
      {/* Zone upload stylée */}
      {canUpload(userRole, phase) && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
          <input type="file" className="cis-input" style={{ flex: 1 }} onChange={(e) => setFile(e.target.files[0])} />
          <select className="cis-select" style={{ width: '150px' }} value={type} onChange={(e) => setType(e.target.value)}>
            {getAvailableTypes().map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="cis-btn cis-btn-primary" onClick={handleUpload}>Ajouter</button>
        </div>
      )}

      {/* Table stylée */}
      <div className="cis-table-wrap">
        <table className="cis-table">
          <thead>
            <tr><th>Nom</th><th>Type</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {['BOM', 'ARCHITECTURE', 'PV_RECETTE', 'EXPLOITATION'].map(cat => {
              const docsCat = documents.filter(d => d.type === cat);
              // On n'affiche que les catégories qui ont des documents
              if (docsCat.length === 0) return null; 
              
              return (
                <React.Fragment key={cat}>
                  {/* Ligne de séparation de catégorie */}
                  <tr>
                    <td colSpan="3" style={{ background: '#f4f5f7', fontWeight: 'bold', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                      {cat}
                    </td>
                  </tr>
                  {docsCat.map(doc => (
                    <tr key={doc.id}>
                      <td>{doc.fileName}</td>
                      <td><span className={`cis-badge badge-${doc.type.includes('PV') || doc.type.includes('EXPLOIT') ? 'green' : 'orange'}`}>{doc.type}</span></td>
                      <td>
                        <button className="cis-btn cis-btn-ghost cis-btn-sm" onClick={() => documentService.download(doc.id, doc.fileName)}>
                          <i className="ti ti-download"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}