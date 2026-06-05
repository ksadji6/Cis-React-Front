import { useState, useEffect, useCallback } from 'react'; // Ajoute useCallback
import { useParams } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { ValidationPrerequis } from '../components/project/ValidationPrerequis';

export const DetailProjet = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  // Utilisation de useCallback pour éviter que la fonction ne soit recréée à chaque rendu
  const fetchProject = useCallback(async () => {
    try {
      const data = await projectService.rechercherProjectById(id);
      setProject(data);
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

  if (!project) return <div>Chargement...</div>;

  return (
    <div style={{ padding: '25px' }}>
      <h1>{project.titre}</h1>
      <ValidationPrerequis 
        project={project} 
        onToggle={handleToggle} 
        onLancer={handleLancer} 
      />
    </div>
  );
};