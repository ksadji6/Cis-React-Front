import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';

export default function SuperviseurDashboard() {
  const [stats, setStats] = useState(null);
  const [listeUsers, setListeUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadAllDashboardData = async () => {
      try {
        const [statsResponse, usersResponse] = await Promise.all([
          projectService.getDashboardStats(),
          userService.getAll()
        ]);
        if (isMounted) {
          if (statsResponse) setStats(statsResponse);
          if (usersResponse && Array.isArray(usersResponse)) setListeUsers(usersResponse);
        }
      } catch (err) {
        console.error("Impossible de charger les métriques.", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAllDashboardData();
    return () => { isMounted = false; };
  }, []);

  const obtenirNomIngenieur = (idStr) => {
    const trouve = listeUsers.find(u => u.id === parseInt(idStr, 10));
    return trouve ? `${trouve.prenom} ${trouve.nom}` : `Ingénieur #${idStr}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #20ab4b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ color: '#888', fontSize: 13 }}>Calcul des indicateurs...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const {
    totalProjets = 0,
    projetsBloques = 0,
    avancementMoyenGlobal = 0,
    repartitionParCategorie = {},
    projetsParPhase = {},
    avancementParProjet = {},
    chargeTravailParIngenieur = {}
  } = stats || {};

  const avancement = Math.round(avancementMoyenGlobal);
  const maxCat = Math.max(...Object.values(repartitionParCategorie), 1);
  const topProjets = Object.entries(avancementParProjet).slice(0, 8);
  const totalUsers = listeUsers.length;
  const ingenieurs = listeUsers.filter(u => u.role === 'INGENIEUR').length;
  const chefs = listeUsers.filter(u => u.role === 'CHEF_PROJET').length;

  const phaseColors = {
    PRE_PROJET: { bg: '#fef3e8', color: '#954a10', bar: '#ec8549' },
    PROJET: { bg: '#e8f7ee', color: '#1a6b38', bar: '#20ab4b' },
    POST_PROJET: { bg: '#e8f0fe', color: '#1a4a8a', bar: '#1a5fb4' },
  };
  const phaseLabels = { PRE_PROJET: 'Pré-projet', PROJET: 'En cours', POST_PROJET: 'Clôturé' };

  return (
    <div>
      <div className="cis-page-header">
        <div>
          <h1 className="cis-page-title">Tableau de bord Supervision</h1>
          <p className="cis-page-sub">Vue consolidée de l'activité CIS Integration</p>
        </div>
      </div>

      <div className="cis-kpi-grid">
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: '#e8f7ee' }}><i className="ti ti-folder" style={{ color: '#20ab4b' }}></i></div>
          <div className="cis-kpi-val">{totalProjets}</div>
          <div className="cis-kpi-lbl">Total projets</div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: projetsBloques > 0 ? '#fff0f0' : '#f5f5f5' }}><i className="ti ti-alert-triangle" style={{ color: projetsBloques > 0 ? '#ef4444' : '#aaa' }}></i></div>
          <div className="cis-kpi-val" style={{ color: projetsBloques > 0 ? '#ef4444' : undefined }}>{projetsBloques}</div>
          <div className="cis-kpi-lbl">Projets bloqués</div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: '#e8f0fe' }}><i className="ti ti-chart-pie" style={{ color: '#1a5fb4' }}></i></div>
          <div className="cis-kpi-val">{avancement}%</div>
          <div className="cis-kpi-lbl">Avancement global</div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: '#e8f7ee' }}><i className="ti ti-users" style={{ color: '#20ab4b' }}></i></div>
          <div className="cis-kpi-val">{totalUsers}</div>
          <div className="cis-kpi-lbl">Effectif total</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="cis-card">
          <div className="cis-card-title">Répartition technologique</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(repartitionParCategorie).map(([cat, val]) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12 }}>{cat}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{val}</span>
                </div>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4 }}>
                  <div style={{ width: `${(val / maxCat) * 100}%`, height: '100%', background: '#1a5fb4', borderRadius: 4 }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cis-card">
          <div className="cis-card-title">Analyse par phase</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['PRE_PROJET', 'PROJET', 'POST_PROJET'].map(phase => {
              const count = projetsParPhase[phase] || 0;
              const total = Object.values(projetsParPhase).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              const style = phaseColors[phase];
              return (
                <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="cis-badge" style={{ background: style.bg, color: style.color }}>{phaseLabels[phase]}</span>
                  <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: style.bar, borderRadius: 4 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cis-card" style={{ marginBottom: 16 }}>
        <div className="cis-card-title">Progression des projets</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topProjets.map(([titre, av]) => (
            <div key={titre}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12 }}>{titre}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{av}%</span>
              </div>
              <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3 }}>
                <div style={{ width: `${av}%`, height: '100%', background: av >= 100 ? '#20ab4b' : '#1a5fb4', borderRadius: 3 }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cis-card">
        <div className="cis-card-title">Charge de travail par ingénieur</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {Object.entries(chargeTravailParIngenieur).map(([ingId, map]) => {
          const nbTaches = Object.values(map).reduce((a, b) => a + b, 0);
          const estSurcharge = nbTaches > 5; // Seuil arbitraire de surcharge

          return (
            <div key={ingId} style={{ 
                padding: 12, 
                background: estSurcharge ? '#fff0f0' : '#f9f9f9', 
                border: estSurcharge ? '1px solid #ef4444' : '1px solid #eee',
                borderRadius: 8 
            }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{obtenirNomIngenieur(ingId)}</div>
              <div style={{ fontSize: 11, color: estSurcharge ? '#c0392b' : '#888' }}>
                {nbTaches} tâche{nbTaches > 1 ? 's' : ''} en cours
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}