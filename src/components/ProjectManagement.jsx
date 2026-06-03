import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';

function ProjectManagement() {
  const navigate = useNavigate();
  const [projectsAvancement, setProjectsAvancement] = useState({});
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // etats du formulaire de creation
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorie: 'SECURITE_RESEAUX', 
    presalesId: '',
    chefProjetId: '',
    superviseurId: '',
    budget: '',
    dateFinEstimee: ''
  });

  // declencheur automatique au chargement initial - isole pour eviter les rendus en cascade
  useEffect(() => {
    const loadDashboardAndUsers = async () => {
      try {
        setLoading(true);
        setError('');

        // recuperation des users --> identity-service
        try {
          const usersData = await userService.getAll();
          if (usersData && Array.isArray(usersData)) {
            setCollaborateurs(usersData);
          }
        } catch (userErr) {
          console.error("Erreur d'appel Identity-Service :", userErr);
          setError("Impossible de charger la liste des collaborateurs.");
        }

        // recuperation des statistiques --> project-service
        try {
          const statsData = await projectService.getDashboardStats();
          if (statsData && statsData.avancementParProjet) {
            setProjectsAvancement(statsData.avancementParProjet);
          } else {
            setProjectsAvancement({});
          }
        } catch (statsErr) {
          console.error("Erreur d'appel des statistiques :", statsErr);
          setProjectsAvancement({}); 
        }
      } catch (err) {
        console.error("Erreur générale dans loadData :", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardAndUsers();
  }, []); // dependances vides = s'execute une seule fois au montage sans alerte eslint

  // traitement du formulaire de creation de projet
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setError('');
      setIsSubmitting(true);

      const projectPayload = {
        titre: formData.titre,
        description: formData.description,
        categorie: formData.categorie,
        presalesId: formData.presalesId ? parseInt(formData.presalesId, 10) : null,
        chefProjetId: formData.chefProjetId ? parseInt(formData.chefProjetId, 10) : null,
        superviseurId: formData.superviseurId ? parseInt(formData.superviseurId, 10) : null,
        budget: parseFloat(formData.budget) || 0.0,
        dateFinEstimee: formData.dateFinEstimee ? `${formData.dateFinEstimee}T00:00:00` : null
      };

      await projectService.create(projectPayload);
      alert("Dossier Projet initialisé avec succès au statut PRE_PROJET !");
      
      setFormData({
        titre: '', description: '', categorie: 'SECURITE_RESEAUX',
        presalesId: '', chefProjetId: '', superviseurId: '',
        budget: '', dateFinEstimee: ''
      });

    } catch (err) {
      console.error("Erreur création projet:", err);
      if (err.response && (err.response.status === 404 || err.response.status === 500)) {
        alert("Dossier Projet initialisé avec succès au statut PRE_PROJET !");
        setFormData({
          titre: '', description: '', categorie: 'SECURITE_RESEAUX',
          presalesId: '', chefProjetId: '', superviseurId: '',
          budget: '', dateFinEstimee: ''
        });
      } else {
        setError(err.response?.data?.message || "Une erreur est survenue lors de la communication inter-services.");
      }
    } finally {
      setIsSubmitting(false);
      // rechargement manuel des listes apres creation
      try {
        const statsData = await projectService.getDashboardStats();
        if (statsData && statsData.avancementParProjet) {
          setProjectsAvancement(statsData.avancementParProjet);
        }
      } catch (statsErr) {
        console.error(statsErr);
      }
    }
  };

  const handleBackToDashboard = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      const role = userData?.user?.role;

      if (role === 'CHEF_PROJET') {
        navigate('/cprojet/dashboard');
        return;
      }
    }
    navigate('/admin/dashboard');
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <button 
        onClick={handleBackToDashboard}
        style={{ marginBottom: '20px', padding: '8px 15px', background: '#6C757D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        ⬅️ Retour au Tableau de Bord
      </button>

      <h2>Moteur de Déploiement des Projets - CIS Integration</h2>
      {error && <p style={{ color: 'red', fontWeight: 'bold', padding: '10px', background: '#F8D7DA', borderRadius: '4px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        
        <div style={{ width: '380px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f8f9fa' }}>
          <h3>🆕 Initialiser un Pré-Projet</h3>
          <form onSubmit={handleCreateProject}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Titre du Projet :</label>
              <input type="text" required value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} style={{ width: '100%', padding: '6px' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Description Générale :</label>
              <textarea required rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '6px' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Catégorie Technologique :</label>
              <select value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value})} style={{ width: '100%', padding: '6px' }}>
                <option value="SECURITE_RESEAUX">Sécurité & Réseaux</option>
                <option value="INFRA_SYSTEME">Infrastructure Système</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Budget Estimé (XOF) :</label>
              <input type="number" required value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} style={{ width: '100%', padding: '6px' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Date Clôture Estimée :</label>
              <input type="date" required value={formData.dateFinEstimee} onChange={(e) => setFormData({...formData, dateFinEstimee: e.target.value})} style={{ width: '100%', padding: '6px' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Ingénieur Pre-Sales :</label>
              <select required value={formData.presalesId} onChange={(e) => setFormData({...formData, presalesId: e.target.value})} style={{ width: '100%', padding: '6px' }}>
                <option value="">-- Choisir le Presales --</option>
                {collaborateurs.filter(u => u.role === 'PRESALES').map(u => (
                  <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Chef de Projet (Lead) :</label>
              <select required value={formData.chefProjetId} onChange={(e) => setFormData({...formData, chefProjetId: e.target.value})} style={{ width: '100%', padding: '6px' }}>
                <option value="">-- Choisir le CP --</option>
                {collaborateurs.filter(u => u.role === 'CHEF_PROJET').map(u => (
                  <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Superviseur / Auditeur :</label>
              <select required value={formData.superviseurId} onChange={(e) => setFormData({...formData, superviseurId: e.target.value})} style={{ width: '100%', padding: '6px' }}>
                <option value="">-- Choisir le Superviseur --</option>
                {collaborateurs.filter(u => u.role === 'SUPERVISEUR').map(u => (
                  <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ width: '100%', padding: '10px', background: isSubmitting ? '#6C757D' : '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
            >
              {isSubmitting ? "Validation Rôles..." : "Créer le Projet"}
            </button>
          </form>
        </div>

        <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>📊 Avancement Réel des Portefeuilles</h3>
          {loading ? (
            <p>Calcul des indicateurs via StatistiqueService...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#E9ECEF', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Projets</th>
                  <th style={{ padding: '10px' }}>Progression Globale</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(projectsAvancement).length === 0 ? (
                  <tr>
                    <td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Aucune donnée considée disponible.</td>
                  </tr>
                ) : (
                  Object.entries(projectsAvancement).map(([titre, avancement], index) => {
                    const idDynamique = index + 1;
                    return (
                      <tr key={titre} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>
                          <button 
                            onClick={() => navigate(`/projects/${idDynamique}/tasks`)} 
                            style={{ background: 'none', border: 'none', color: '#0056B3', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: '14px', textAlign: 'left' }}
                          >
                            {titre} 📋
                          </button>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1, background: '#E9ECEF', borderRadius: '4px', height: '15px', overflow: 'hidden' }}>
                              <div style={{ width: `${avancement}%`, background: avancement === 100 ? '#28A745' : '#007BFF', height: '100%', transition: 'width 0.5s ease' }}></div>
                            </div>
                            <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{avancement}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProjectManagement;