import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';

function ChefProjetDashboard() {
  const [stats, setStats] = useState(null);
  const [listeUsers, setListeUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // charger toutes les donnees
  useEffect(() => {
    const loadAllDashboardData = async () => {
      try {
        setLoading(true);
        
        const statsResponse = await projectService.getDashboardStats();
        if (statsResponse) {
          setStats(statsResponse);
        }

        const usersResponse = await userService.getAll();
        if (usersResponse && Array.isArray(usersResponse)) {
          setListeUsers(usersResponse);
        }

      } catch (err) {
        console.error("erreur chargement donnees dashboard :", err);
        setError("impossible de charger completement les metriques.");
      } finally {
        setLoading(false);
      }
    };
    loadAllDashboardData();
  }, []);

  // trouver le nom de l'ingenieur a partir de son id
  const obtenirNomIngenieur = (idStr) => {
    if (idStr === "Non assigne") return "Non assigné";
    const idNum = parseInt(idStr, 10);
    const trouve = listeUsers.find(u => u.id === idNum);
    return trouve ? `${trouve.prenom} ${trouve.nom}` : `Ingénieur ${idStr}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial', color: '#4a5568' }}>
        <h2>calcul et consolidation des indicateurs decisionnels...</h2>
      </div>
    );
  }

  // extraction des donnees securisee avec des valeurs par defaut
  const totalProjets = stats?.totalProjets || 0;
  const projetsBloques = stats?.projetsBloques || 0;
  const avancementMoyenGlobal = stats?.avancementMoyenGlobal ? Math.round(stats.avancementMoyenGlobal) : 0;
  const repartitionParCategorie = stats?.repartitionParCategorie || { "SECURITE_RESEAUX": 0, "INFRA_SYSTEME": 0 };
  const projetsParPhase = stats?.projetsParPhase || { "PRE_PROJET": 0, "PROJET": 0, "POST_PROJET": 0 };
  const avancementParProjet = stats?.avancementParProjet || {};
  const chargeTravailParIngenieur = stats?.chargeTravailParIngenieur || {};

  return (
    <div style={{ marginBottom: '25px' }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Direction des Déploiements d'Intégration</h2>
          {error && <p style={{ color: 'red', margin: '5px 0 0 0' }}>{error}</p>}
        

        {/* blocs kpi */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Projets</span>
            <h3 style={{ margin: '5px 0 0 0', fontSize: '28px' }}>{totalProjets}</h3>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Dossiers Bloqués</span>
            <h3 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#ef4444' }}>{projetsBloques}</h3>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #06b6d4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Avancement Moyen Global</span>
            <h3 style={{ margin: '5px 0 0 0', fontSize: '28px' }}>{avancementMoyenGlobal}%</h3>
          </div>
        </div>

        {/* grille des graphiques */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          
          {/* graphique 1 : categories */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '15px' }}>1. Répartition par Catégorie Technologique</h4>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '140px', borderBottom: '2px solid #cbd5e1' }}>
              {Object.entries(repartitionParCategorie).map(([cat, val]) => {
                const maxVal = Math.max(...Object.values(repartitionParCategorie), 1);
                const heightBar = (val / maxVal) * 110;
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>{val}</span>
                    <div style={{ width: '50px', height: `${heightBar}px`, backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0' }}></div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
              <span>Sécurité & Réseaux</span>
              <span>Infrastructure Système</span>
            </div>
          </div>

          {/* graphique 2 : circulaire des phases */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '15px' }}>2. Analyse des Dossiers par Phase</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '25px', height: '160px' }}>
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'conic-gradient(#f59e0b 0% 33%, #3b82f6 33% 66%, #10b981 66% 100%)', boxShadow: 'inset 0 0 0 22px white' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontWeight: '600' }}>
                <div><span style={{ color: '#f59e0b' }}>■</span> PRE_PROJET : {projetsParPhase.PRE_PROJET || 0}</div>
                <div><span style={{ color: '#3b82f6' }}>■</span> PROJET : {projetsParPhase.PROJET || 0}</div>
                <div><span style={{ color: '#10b981' }}>■</span> POST_PROJET : {projetsParPhase.POST_PROJET || 0}</div>
              </div>
            </div>
          </div>

          {/* graphique 3 : avancement des projets */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '15px' }}>3. Progression Individuelle des Livrables</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '180px', overflowY: 'auto' }}>
              {Object.entries(avancementParProjet).map(([titre, avancement]) => (
                <div key={titre}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    <span>{titre}</span>
                    <span>{avancement}%</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${avancement}%`, backgroundColor: avancement === 100 ? '#10b981' : '#3b82f6', height: '100%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* graphique 4 : charge de travail par ingenieur */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '15px' }}>4. Charge Opérationnelle par Ingénieur</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto' }}>
              {Object.entries(chargeTravailParIngenieur).map(([ingId, statutsMap]) => {
                const totalTaches = Object.values(statutsMap).reduce((a, b) => a + b, 0);
                return (
                  <div key={ingId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '120px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {obtenirNomIngenieur(ingId)}
                    </span>
                    <div style={{ flex: 1, backgroundColor: '#e2e8f0', height: '18px', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: `${Math.min(totalTaches * 20, 100)}%`, backgroundColor: '#8b5cf6', height: '100%' }}></div>
                      <span style={{ position: 'absolute', right: '6px', top: '1px', fontSize: '10px', fontWeight: 'bold' }}>{totalTaches} tâche(s)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    
  );
};
export default ChefProjetDashboard;