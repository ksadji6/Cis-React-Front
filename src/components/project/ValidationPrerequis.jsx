export const ValidationPrerequis = ({ project, onToggle, onLancer }) => {
  // 1. Sécurité : Si project ou prerequis est undefined, on utilise un tableau vide
  const prerequis = project?.prerequis || [];

  // 2. Vérification : Tous les prérequis sont-ils validés ?
  const tousValides = prerequis.length > 0 && prerequis.every(p => p.estDisponible);

  return (
    <div className="card">
      <h3 style={{ color: '#1e293b', marginBottom: '20px' }}>Contrôle Qualité : Prérequis</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {(project?.prerequis || []).map((p) => (
          <div key={p.id} style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            backgroundColor: p.estDisponible ? '#f0fdf4' : '#fff1f2',
            border: `1px solid ${p.estDisponible ? '#bbf7d0' : '#fecaca'}`
          }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={p.estDisponible}
                onChange={() => onToggle(p.id)}
                style={{ transform: 'scale(1.2)', marginRight: '10px' }}
              />
              <span style={{ fontWeight: '600', color: p.estDisponible ? '#166534' : '#991b1b' }}>
                {p.libelle}
              </span>
            </label>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <button 
          disabled={!tousValides}
          onClick={() => onLancer(project.id)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: tousValides ? '#2563eb' : '#94a3b8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: tousValides ? 'pointer' : 'not-allowed'
          }}
        >
          {tousValides ? "Lancer le Projet vers Phase Exécution" : "Prérequis incomplets"}
        </button>
      </div>
    </div>
  );
};