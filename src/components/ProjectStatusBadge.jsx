export const ProjectStatusDisplay = ({ project, userRole, onStatusChange }) => {
  const canEdit = userRole === 'ADMIN' || userRole === 'CHEF_PROJET';

  if (canEdit) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <select 
          value={project.statut} 
          onChange={(e) => onStatusChange(project.id, e.target.value)}
          className="cis-select"
        >
          <option value="EN_ATTENTE">En attente</option>
          <option value="EN_COURS">En cours</option>
          <option value="BLOQUE">Bloqué</option>
          <option value="TERMINE">Terminé</option>
        </select>
        {project.statut === 'BLOQUE' && (
          <input 
            className="cis-input"
            placeholder="Motif du blocage..."
            value={project.commentaireBloquant || ''}
            onChange={(e) => {/* Logique de mise à jour commentaire */}}
          />
        )}
      </div>
    );
  }

  // Vue Read-Only pour les autres (Ingénieur, Presales, Superviseur)
  return (
    <div>
      <span className={`cis-badge status-${project.statut.toLowerCase()}`}>
        {project.statut}
      </span>
      {project.statut === 'BLOQUE' && (
        <p style={{ color: 'red', fontSize: '11px' }}>
          Motif : {project.commentaireBloquant}
        </p>
      )}
    </div>
  );
};