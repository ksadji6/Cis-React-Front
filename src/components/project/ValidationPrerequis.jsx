export const ValidationPrerequis = ({ project, onToggle, onLancer }) => {
  return (
    <div className="card">
      <h3 style={{ color: '#1e293b', marginBottom: '20px' }}>Contrôle Qualité : Prérequis</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {project.prerequis.map((p) => (
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
          disabled={!project.prerequis.every(p => p.estDisponible)}
          onClick={() => onLancer(project.id)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: project.prerequis.every(p => p.estDisponible) ? '#2563eb' : '#94a3b8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: project.prerequis.every(p => p.estDisponible) ? 'pointer' : 'not-allowed'
          }}
        >
          {project.prerequis.every(p => p.estDisponible) ? "Lancer le Projet vers Phase Exécution" : "Prérequis incomplets"}
        </button>
      </div>
    </div>
  );
};