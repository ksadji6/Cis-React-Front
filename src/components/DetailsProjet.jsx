import { useState, useEffect, useCallback } from 'react'; // Ajoute useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { ValidationPrerequis } from '../components/project/ValidationPrerequis';
import DocumentSection from './DocumentSection';
import { documentService } from '../services/documentService';
import CollaboratorList from './CollaboratoList';

export const DetailProjet = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'))?.user;
  const userRole = user?.role;
  const navigate=useNavigate();

  // Utilisation de useCallback pour éviter que la fonction ne soit recréée à chaque rendu
  const fetchProject = useCallback(async () => {
    try {
      const data = await projectService.rechercherProjectById(id);
      const docs = await documentService.getByProjectId(id);
      const updatedProject = { ...data, documents: docs };
      setProject(updatedProject);
      console.log("Prérequis reçus dans le state :", updatedProject.prerequis);
    } catch (err) {
      console.error("Erreur chargement projet:", err);
    }
  }, [id]); // Dépendance sur id

  useEffect(() => { 
    fetchProject(); 
  }, [fetchProject]); // Appel sécurisé

const handleToggle = async (prerequisId) => {
    try {
        await projectService.togglePrerequis(id, prerequisId);
        fetchProject(); 
    } catch (err) {
        alert("Erreur lors de la mise à jour du prérequis");
    }
};

const handleAddPrerequis = async () => {
    const libelle = prompt("Quel est le nouveau prérequis technique ?");
    if (libelle && libelle.trim() !== "") {
        try {
            await projectService.addPrerequis(id, libelle);
            fetchProject(); // Recharge automatiquement les données
        } catch (e) {
            alert("Erreur lors de l'ajout");
        }
    }
};


  const handleLancer = async (projectId) => {
    await projectService.lancerProjet(projectId);
    fetchProject(); 
  };

  const handleCloturer = async () => {
  if (window.confirm("Confirmer la clôture du projet ?")) {
    await projectService.cloturer(id); 
    fetchProject();
  }
};
const handleUpdateStatus = async (projectId, nouveauStatut) => {
    let commentaire = project.commentaireBloquant || ""; // On pré-remplit avec l'actuel
    
    if (nouveauStatut === 'BLOQUE') {
        const input = prompt("Veuillez saisir le motif du blocage :", commentaire);
        if (input === null) return; // L'utilisateur a annulé
        commentaire = input;
    } else {
        commentaire = ""; // On vide si on change de statut
    }
    
    try {
        await projectService.updateStatut(projectId, nouveauStatut, commentaire);
        fetchProject(); 
    } catch (err) {
        alert("Erreur lors de la mise à jour");
    }
};

  if (!project) return <div>Chargement...</div>;
  console.log("Données du projet chargées :", project);

  return (
    <div style={{ padding: '25px' }}>
    <div className="cis-page-header">
      <button onClick={() => navigate('/admin/projects/list')} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:12, marginBottom:6, display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-arrow-left" aria-hidden="true"></i> Retour
          </button>
      <h1>{project.titre}</h1>
      {/*bouton Clôturer si le projet est en cours */}
      {project.phase === 'PROJET' && (userRole === 'ADMIN' || userRole === 'CHEF_PROJET') && (
        <button className="cis-btn cis-btn-primary" onClick={handleCloturer}>
           Clôturer le Projet
        </button>
      )}
      
    </div>
    <div className="cis-card">
    <div className="cis-card-title">Équipe projet</div>
      <CollaboratorList 
        chefId={project.chefProjetId} 
        presalesId={project.presalesId} 
        ingenieurIds={project.ingenieurIds} // Assure-toi que ton backend envoie la liste
      />
  </div>
      
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      
      {/* --- SECTION PRÉREQUIS & AJOUT --- */}
<div className="cis-card">
    <div className="cis-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Prérequis techniques</span>
        
        {/* Le bouton d'ajout n'apparaît que pour le Presales en phase de préparation */}
        {userRole === 'PRESALES' && project.phase === 'PRE_PROJET' && (
            <button 
                className="cis-btn cis-btn-ghost cis-btn-sm" 
                onClick={handleAddPrerequis}
            >
                <i className="ti ti-plus"></i> Ajouter un prérequis
            </button>
        )}
    </div>

    {project.phase === 'PRE_PROJET' ? (
        <ValidationPrerequis 
            project={project} 
            onToggle={handleToggle} 
            onLancer={handleLancer} 
            userRole={userRole}
        />
    ) : (
        <div style={{ padding: '10px' }}>
            <div className="cis-badge badge-green">Prérequis validés et projet lancé</div>
        </div>
    )}
</div>
      

      {/* Remplacement du select simple par une logique de rôle */}
    <div className="cis-form-group">
      <label className="cis-label">Statut du projet</label>
      {project.phase === 'PROJET' &&(userRole === 'ADMIN' || userRole === 'CHEF_PROJET') ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <select 
      value={project.statut} 
      onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
      className="cis-select"
    >
      <option value="EN_ATTENTE">En attente</option>
      <option value="EN_COURS">En cours</option>
      <option value="BLOQUE">Bloqué</option>
      <option value="TERMINE">Terminé</option>
    </select>
    
    {/* Affichage du commentaire même pour le Chef/Admin */}
    {project.statut === 'BLOQUE' && project.commentaireBloquant && (
      <div style={{ padding: '8px', background: '#fff0f0', borderRadius: '4px', fontSize: '12px', color: '#d9534f' }}>
        <strong>Motif actuel :</strong> {project.commentaireBloquant}
      </div>
    )}
  </div>
      ) : (
        <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #eee' }}>
      <span className={`cis-badge status-${project.statut.toLowerCase()}`}>
        {project.statut}
      </span>
      {project.statut === 'BLOQUE' && project.commentaireBloquant && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#d9534f' }}>
          <strong>Motif du blocage :</strong> {project.commentaireBloquant}
        </div>
      )}
    </div>
    )}
</div>
      
      {/* Nouvelle section pour les documents */}
      <DocumentSection 
        projectId={id} 
        documents={project.documents || []} 
        userRole={userRole} 
        phase={project.phase}
        onUploadSuccess={fetchProject} 
/>
    </div>
  </div>
  );
  
};