import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import { jwtDecode } from 'jwt-decode';

export default function IngenieurTasks() {
  const [mesTaches, setMesTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*const loadMesTaches = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Session expirée, veuillez vous reconnecter.");
      }
      
      // Extraction de l'ID depuis le token
      const decoded = jwtDecode(token);
      const userId = decoded.userId; 

      if (!userId) {
        throw new Error("ID utilisateur introuvable.");
      }

      // Appel au service
      const data = await projectService.getMesTaches(userId);
      setMesTaches(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les tâches. Vérifiez vos permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMesTaches();
  }, [loadMesTaches]);
*/
const loadMesTaches = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Session expirée.");
      
      const decoded = jwtDecode(token);
      const userId = decoded.userId; 

      console.log("DEBUG - Token décodé (ID):", userId);

      // Appel au service
      const data = await projectService.getMesTaches(userId);
      
      // LOG TRÈS IMPORTANT : Voir la structure exacte des données
      console.log("DEBUG - Données reçues du Backend:", data); 

      setMesTaches(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Erreur complète:", err); // Affiche l'erreur détaillée
      setError("Impossible de charger les tâches.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadMesTaches();
  }, [loadMesTaches]);
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await projectService.updateTaskStatus(taskId, newStatus);
      alert("Statut mis à jour avec succès !");
      loadMesTaches(); // Rafraîchit la liste
    } catch (err) {
      alert("Erreur lors de la mise à jour du statut. ",err);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Chargement...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red', fontWeight: 'bold' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Mes Tâches Assignées</h2>
      <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse', marginTop: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Projet</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Tâche</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Chef de Projet</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Délais</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Statut</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {mesTaches.length > 0 ? (
            mesTaches.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>{t.projectTitle || "N/A"}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{t.intitule}</td>
                <td style={{ padding: '12px' }}>{t.chefProjetNom}</td>
                <td>{t.delais ? new Date(t.delais).toLocaleDateString() : "Pas de délai"}</td>
                <td style={{ padding: '12px' }}>{t.statut}</td>
                <td style={{ padding: '12px' }}>
                  <select 
                    value={t.statut} 
                    onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px' }}
                  >
                    <option value="A_FAIRE">À FAIRE</option>
                    <option value="EN_COURS">EN COURS</option>
                    <option value="TERMINE">TERMINE</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Aucune tâche trouvée.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}