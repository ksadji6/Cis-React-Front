import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // session utilisateur
  const userString = localStorage.getItem('user');
  const userData = userString ? JSON.parse(userString) : null;
  const prenom = userData?.user?.prenom || 'Chef';
  const nom = userData?.user?.nom || 'Projet';

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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial', color: '#4a5568' }}>
        <h2>chargement du portefeuille de projets cis...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', fontFamily: 'Arial', backgroundColor: '#f0f2f5', minHeight: '100vh', margin: 0, color: '#1e293b' }}>
      
      {/* structure sidebar gauche identique au dashboard */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid #334155', marginBottom: '20px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#475569', margin: '0 auto 10px auto', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>👨‍💼</div>
          <h3 style={{ margin: '5px 0', fontSize: '16px' }}>{prenom} {nom}</h3>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Chef de Projet</span>
        </div>

        <h4 style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>Navigation</h4>
        <button onClick={() => navigate('/cprojet/dashboard')} style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: '6px', color: '#cbd5e1', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>📊 Dashboard</button>
        <button onClick={() => navigate('/admin/projects/create')} style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: '6px', color: '#cbd5e1', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>🆕 Initialiser Projet</button>
        <button onClick={() => navigate('/admin/projects/list')} style={{ width: '100%', padding: '12px', textAlign: 'left', background: '#334155', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginBottom: 'auto' }}>📋 Affectation Tâches</button>

        <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Se déconnecter</button>
      </div>

      {/* contenu principal a droite */}
      <div style={{ flex: 1, padding: '25px', boxSizing: 'border-box', overflowY: 'auto' }}>
        
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Portefeuille Général des Projets</h2>
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
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>aucun projet disponible dans la base de données.</td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>
                    {/* affichage des vrais attributs du backend */}
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
    </div>
  );
}