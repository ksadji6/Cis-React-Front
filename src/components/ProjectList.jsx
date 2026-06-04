import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // etats pour les filtres 
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TOUS');

  

  // charger la liste des projets depuis la bdd
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      // appel de ton nouveau getmapping du backend
      const projetsReels = await projectService.getAllProjects(); 
      
      if (projetsReels && Array.isArray(projetsReels)) {
        setProjects(projetsReels);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("erreur portefeuille projets :", err);
      setError("impossible de charger le portefeuille de projets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPortefeuille = async () => {
      await loadProjects();
    };
    fetchPortefeuille();
  }, []); 

  // Logique de filtrage (useMemo pour optimiser)
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.titre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'TOUS' || p.categorie === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchTerm, categoryFilter]);

  // declencher le changement de phase reel en bdd
  const handleLaunchProject = async (projectId) => {
    try {
      setError('');
      
      // appel de ton put avec le vrai id du projet
      await projectService.lancerProjet(projectId);
      
      alert(`le projet ID ${projectId} est maintenant en phase active.`);
      loadProjects();
    } catch (err) {
      console.error("erreur lancement projet :", err);
      const backendMessage = err.response?.data?.message || "un prerequis metier a echoue.";
      alert(`impossible de lancer le projet : ${backendMessage}`);
      setError(`erreur projet ${projectId} : ${backendMessage}`);
    }
  };

  

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial', color: '#4a5568' }}>
        <h2>chargement du portefeuille de projets cis...</h2>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '25px' }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Portefeuille Général des Projets</h2>
    
      {/* Barre de Filtres */}
      <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <input type="text" placeholder="Rechercher par titre..." onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: 1 }} />
        <select onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
          <option value="TOUS">Toutes catégories</option>
          <option value="SECURITE_RESEAUX">Sécurité & Réseaux</option>
          <option value="INFRA_SYSTEME">Infrastructure Système</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, fontSize: '18px' }}>Sélectionner un projet pour gérer ses jalons</h3>
        
        {error && <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</p>}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '14px' }}>
              <th style={{ padding: '12px' }}>id bdd</th>
              <th style={{ padding: '12px' }}>nom du projet</th>
              <th style={{ padding: '12px' }}>phase actuelle</th>
              <th style={{ padding: '12px' }}>avancement moyen</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>actions cp</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>aucun projet trouvé.</td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>
                  <td style={{ padding: '14px', fontWeight: 'bold', color: '#64748b' }}>{project.id}</td>
                  <td style={{ padding: '14px', fontWeight: 'bold' }}>{project.titre}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: project.phase === 'PROJET' ? '#ddbefe' : '#fef3c7', color: project.phase === 'PROJET' ? '#6b21a8' : '#92400e' }}>
                      {project.phase}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontWeight: 'bold', color: '#3182ce' }}>{project.avancement || 0}%</td>
                  <td style={{ padding: '14px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {project.phase === 'PRE_PROJET' ? (
                      <button onClick={() => handleLaunchProject(project.id)} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>lancer le projet</button>
                    ) : (
                      <button onClick={() => navigate(`/admin/projects/${project.id}/tasks`)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>gerer les taches</button>
                    )}
                    <button disabled style={{ padding: '6px 12px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontSize: '12px' }}>documents</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    
  );
}