import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { StatCard } from './dashboard/StatCard';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

function ChefProjetDashboard() {
  const [stats, setStats] = useState(null);
  const [listeUsers, setListeUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadAllDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, usersResponse] = await Promise.all([
          projectService.getDashboardStats(),
          userService.getAll()
        ]);
        if (statsResponse) setStats(statsResponse);
        if (usersResponse && Array.isArray(usersResponse)) setListeUsers(usersResponse);
      } catch (err) {
        setError("Impossible de charger les métriques. ",err);
      } finally {
        setLoading(false);
      }
    };
    loadAllDashboardData();
  }, []);

  const obtenirNomIngenieur = (idStr) => {
    const trouve = listeUsers.find(u => u.id === parseInt(idStr, 10));
    return trouve ? `${trouve.prenom} ${trouve.nom}` : `Ingénieur ${idStr}`;
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Calcul et consolidation des indicateurs...</div>;

  const { totalProjets, projetsBloques, avancementMoyenGlobal, repartitionParCategorie, projetsParPhase, avancementParProjet, chargeTravailParIngenieur } = {
    totalProjets: stats?.totalProjets || 0,
    projetsBloques: stats?.projetsBloques || 0,
    avancementMoyenGlobal: stats?.avancementMoyenGlobal ? Math.round(stats.avancementMoyenGlobal) : 0,
    repartitionParCategorie: stats?.repartitionParCategorie || { "SECURITE_RESEAUX": 0, "INFRA_SYSTEME": 0 },
    projetsParPhase: stats?.projetsParPhase || { "PRE_PROJET": 0, "PROJET": 0, "POST_PROJET": 0 },
    avancementParProjet: stats?.avancementParProjet || {},
    chargeTravailParIngenieur: stats?.chargeTravailParIngenieur || {}
  };

  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', color: '#0f172a', margin: 0 }}>Tableau de Bord - Pilotage Projet</h2>
      </header>

      {/* 1. KPIs */}
      <section className="kpi-grid">
        <StatCard title="Total Projets" value={totalProjets} color="#3b82f6" icon="📁" />
        <StatCard title="Dossiers Bloqués" value={projetsBloques} color="#ef4444" icon="⚠️" />
        <StatCard title="Avancement Global" value={`${avancementMoyenGlobal}%`} color="#06b6d4" icon="🚀" />
      </section>

      {/* 2. GRAPHIQUES */}
      <section className="main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
        
        {/* Colonne Gauche : Graphiques 1 & 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div className="card">
            <h4 style={{ margin: '0 0 20px 0', fontSize: '15px' }}>1. Répartition Technologique</h4>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '140px', borderBottom: '2px solid #cbd5e1' }}>
              {Object.entries(repartitionParCategorie).map(([cat, val]) => (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{val}</span>
                  <div style={{ width: '50px', height: `${(val / Math.max(...Object.values(repartitionParCategorie), 1)) * 100}px`, backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0' }}></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h4 style={{ margin: '0 0 20px 0', fontSize: '15px' }}>2. Analyse par Phase</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'conic-gradient(#f59e0b 0% 33%, #3b82f6 33% 66%, #10b981 66% 100%)' }}></div>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>
                <div><span style={{ color: '#f59e0b' }}>■</span> PRE_PROJET: {projetsParPhase.PRE_PROJET}</div>
                <div><span style={{ color: '#3b82f6' }}>■</span> PROJET: {projetsParPhase.PROJET}</div>
                <div><span style={{ color: '#10b981' }}>■</span> POST_PROJET: {projetsParPhase.POST_PROJET}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Progression */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h4 style={{ margin: '0 0 20px 0', fontSize: '15px' }}>3. Progression Individuelle (Top 10)</h4>
          {Object.entries(avancementParProjet).slice(0, 10).map(([titre, av]) => (
            <div key={titre} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}><span>{titre}</span><span>{av}%</span></div>
              <div style={{ width: '100%', background: '#e2e8f0', height: '8px', borderRadius: '4px' }}>
                <div style={{ width: `${av}%`, background: '#3b82f6', height: '100%', borderRadius: '4px' }}></div>
              </div>
            </div>
          ))}
          {Object.entries(avancementParProjet).length > 10 && (
            <button onClick={() => navigate('/admin/projects/list')} style={{ background: 'none', border: 'none', color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}>
              + Voir tout le portefeuille
            </button>
          )}
        </div>

        {/* Ligne du bas : Charge par Ingénieur (span 3) */}
        <div className="card" style={{ gridColumn: 'span 3' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '15px' }}>4. Charge Opérationnelle par Ingénieur</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            {Object.entries(chargeTravailParIngenieur).map(([ingId, map]) => (
              <div key={ingId} style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{obtenirNomIngenieur(ingId)}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{Object.values(map).reduce((a, b) => a + b, 0)} tâches actives</div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}

export default ChefProjetDashboard;