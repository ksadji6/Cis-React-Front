import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';

export default function TaskManager() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [ingenieurs, setIngenieurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [taskForm, setTaskForm] = useState({
    intitule: '',
    ingenieurId: '',
    dateCreation: new Date().toISOString().split('T')[0]
  });

  const userString = localStorage.getItem('user');
  const userData = userString ? JSON.parse(userString) : null;
  const prenom = userData?.user?.prenom || 'Chef';
  const nom = userData?.user?.nom || 'Projet';
  const userConnectedId = userData?.user?.id;

  // effect asynchrone autonome pour le chargement initial des dependances du projet
  const loadPageData = async () => {
    try {
      setLoading(true);
      setError('');

      const projectData = await projectService.getById(projectId);
      if (projectData) {
        setProject(projectData);
      }

      const usersData = await userService.getAll();
      if (usersData && Array.isArray(usersData)) {
        const filtrerIngenieurs = usersData.filter(u => u.role === 'INGENIEUR');
        setIngenieurs(filtrerIngenieurs);
      }
    } catch (err) {
      console.error("erreur chargement gestionnaire de taches :", err);
      setError("impossible de charger les donnees de ce projet.");
    } finally {
      setLoading(false);
    }
  };

  // Effect asynchrone autonome pour le chargement initial des dépendances du projet
  useEffect(() => {
    // 1. On définit la fonction directement DANS l'effet
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError('');

        const projectData = await projectService.getById(projectId);
        if (projectData) {
          setProject(projectData);
        }

        const usersData = await userService.getAll();
        if (usersData && Array.isArray(usersData)) {
          const filtrerIngenieurs = usersData.filter(u => u.role === 'INGENIEUR');
          setIngenieurs(filtrerIngenieurs);
        }
      } catch (err) {
        console.error("erreur chargement gestionnaire de taches :", err);
        setError("impossible de charger les donnees de ce projet.");
      } finally {
        setLoading(false);
      }
    };

    // 2. On l'exécute immédiatement
    loadPageData();
  }, [projectId]); // re-execute proprement si l'ID projet change dans l'adresse URL
  // Dans TaskManager.jsx
const handleAddTask = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
        setError('');
        setIsSubmitting(true);

        const taskPayload = {
            intitule: taskForm.intitule,
            ingenieurId: parseInt(taskForm.ingenieurId, 10),
            dateCreation: `${taskForm.dateCreation}T00:00:00`
        };

        // Ton service appelle le contrôleur ci-dessus
        await projectService.createTask(projectId, taskPayload);
        
        alert("Tâche créée avec succès !");
        
        setTaskForm({ /* ... reset ... */ });
        
    } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur lors de la création.");
    } finally {
        setIsSubmitting(false);
        // C'est ici que la liste se met à jour visuellement
        await loadPageData(); 
    }
};

// Fonction pour mettre à jour le statut
const handleUpdateStatus = async (taskId, newStatus) => {
  try {
    await projectService.updateTaskStatus(taskId, newStatus);
    alert("Statut mis à jour avec succès !");
    await loadPageData(); // Recharge la liste
  } catch (err) {
    alert("Erreur lors de la mise à jour du statut. ", err);
  }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const obtenirNomIngenieur = (id) => {
    const trouve = ingenieurs.find(u => u.id === id);
    return trouve ? `${trouve.prenom} ${trouve.nom}` : `Ingénieur ${id}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial', color: '#4a5568' }}>
        <h2>chargement du gestionnaire de tâches...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', fontFamily: 'Arial', backgroundColor: '#f0f2f5', minHeight: '100vh', margin: 0, color: '#1e293b' }}>
      
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

      <div style={{ flex: 1, padding: '25px', boxSizing: 'border-box', overflowY: 'auto' }}>
        
        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px' }}>Affectation des Tâches Opérationnelles</h2>
            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontWeight: 'bold' }}>Projet : {project?.titre} (ID MySQL: {projectId})</p>
            <p style={{ margin: '5px 0 0 0', color: '#3b82f6', fontWeight: 'bold' }}>Avancement Actuel : {project?.avancement || 0}%</p>
          </div>
          <button onClick={() => navigate('/admin/projects/list')} style={{ padding: '8px 14px', background: '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>⬅ Retour à la liste</button>
        </div>

        {error && <p style={{ color: 'red', fontWeight: 'bold', padding: '10px', background: '#f8d7da', borderRadius: '4px' }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '25px' }}>
          
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: 'fit-content' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Créer une nouvelle tâche</h3>
            
            <form onSubmit={handleAddTask} style={{ marginTop: '15px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>Intitulé de la tâche :</label>
                <input type="text" required value={taskForm.intitule} onChange={(e) => setTaskForm({...taskForm, intitule: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>Ingénieur à assigner :</label>
                <select required value={taskForm.ingenieurId} onChange={(e) => setTaskForm({...taskForm, ingenieurId: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}>
                  <option value="">-- Choisir l'ingénieur --</option>
                  {ingenieurs.map(u => (
                    <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>Date d'affectation :</label>
                <input type="date" required value={taskForm.dateCreation} onChange={(e) => setTaskForm({...taskForm, dateCreation: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
              </div>

              <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isSubmitting ? "affectation..." : "Assigner la tâche"}
              </button>
            </form>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Tâches planifiées et jalons</h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '13px' }}>
                  <th style={{ padding: '10px' }}>id</th>
                  <th style={{ padding: '10px' }}>intitule de la tache</th>
                  <th style={{ padding: '10px' }}>ingenieur affecte</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>statut</th>
                </tr>
              </thead>
              <tbody>
                {!project?.tasks || project.tasks.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>aucune tâche n'a encore été planifiée pour ce déploiement.</td>
                  </tr>
                ) : (
                  project.tasks.map((task) => (
                    <tr key={task.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#64748b' }}>{task.id}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{task.intitule}</td>
                      <td style={{ padding: '12px' }}>{obtenirNomIngenieur(task.ingenieurId)}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {userConnectedId === task.ingenieurId ? (
                          <select 
                            value={task.statut} 
                            onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                            style={{ fontSize: '11px', padding: '4px', cursor: 'pointer' }}
                          >
                            <option value="A_FAIRE">À FAIRE</option>
                            <option value="EN_COURS">EN COURS</option>
                            <option value="TERMINE">TERMINE</option>
                          </select>
                        ) : (
                          <span style={{ 
                            padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                            background: task.statut === 'TERMINE' ? '#d1fae5' : task.statut === 'EN_COURS' ? '#dbeafe' : '#f3f4f6',
                            color: task.statut === 'TERMINE' ? '#065f46' : task.statut === 'EN_COURS' ? '#1e40af' : '#374151'
                          }}>
                            {task.statut}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}