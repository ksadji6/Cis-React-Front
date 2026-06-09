import { useState, useEffect, useCallback } from 'react'; // Ajoute useCallback
import { useParams } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { ValidationPrerequis } from '../components/project/ValidationPrerequis';
import DocumentSection from './DocumentSection';
import { documentService } from '../services/documentService';

export const DetailProjet = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'))?.user;
  const userRole = user?.role;

  // Utilisation de useCallback pour éviter que la fonction ne soit recréée à chaque rendu
  const fetchProject = useCallback(async () => {
    try {
      const data = await projectService.rechercherProjectById(id);
      const docs = await documentService.getByProjectId(id);
      setProject({ ...data, documents: docs });
    } catch (err) {
      console.error("Erreur chargement projet:", err);
    }
  }, [id]); // Dépendance sur id

  useEffect(() => { 
    fetchProject(); 
  }, [fetchProject]); // Appel sécurisé

  const handleToggle = async (prerequisId) => {
    await projectService.togglePrerequis(id, prerequisId);
    fetchProject(); 
  };

  const handleLancer = async (projectId) => {
    await projectService.lancerProject(projectId);
    fetchProject(); 
  };

  const handleCloturer = async () => {
  if (window.confirm("Confirmer la clôture du projet ?")) {
    await projectService.cloturer(id); 
    fetchProject();
  }
};

  if (!project) return <div>Chargement...</div>;
  console.log("Données du projet chargées :", project);

  return (
    <div style={{ padding: '25px' }}>
    <div className="cis-page-header">
      <h1>{project.titre}</h1>
      {/* Ajoute ici le bouton Clôturer si le projet est en cours */}
      {project.phase === 'PROJET' && project.avancement === 100 && (
        <button className="cis-btn cis-btn-primary" onClick={handleCloturer}>
           Clôturer le Projet
        </button>
      )}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <ValidationPrerequis 
        project={project} 
        onToggle={handleToggle} 
        onLancer={handleLancer} 
      />
      
      {/* Nouvelle section pour les documents */}
      <DocumentSection 
        projectId={id} 
        documents={project.documents || []} 
        userRole={userRole} 
        onUploadSuccess={fetchProject} 
/>
    </div>
  </div>
  );
  
};