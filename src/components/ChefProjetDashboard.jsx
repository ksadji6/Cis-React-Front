import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';

function ChefProjetDashboard() {
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
  }, []); // ← une seule fois au montage

  const obtenirNomIngenieur = (idStr) => {
    const trouve = listeUsers.find(u => u.id === parseInt(idStr, 10));
    return trouve ? `${trouve.prenom} ${trouve.nom}` : `Ingénieur ${idStr}`;
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

  const phaseColors = {
    PRE_PROJET: { bg: '#fef3e8', color: '#954a10', bar: '#ec8549' },
    PROJET: { bg: '#e8f7ee', color: '#1a6b38', bar: '#20ab4b' },
    POST_PROJET: { bg: '#e8f0fe', color: '#1a4a8a', bar: '#1a5fb4' },
  };

  return (
    <div>
      {/* Header */}
      <div className="cis-page-header">
        <div>
          <h1 className="cis-page-title">Tableau de bord</h1>
          <p className="cis-page-sub">Pilotage en temps réel — {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="cis-btn cis-btn-primary" onClick={() => navigate('/admin/projects/create')}>
          <i className="ti ti-plus" aria-hidden="true"></i>
          Nouveau projet
        </button>
      </div>

      {/* KPIs */}
      <div className="cis-kpi-grid">
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: '#e8f7ee' }}>
            <i className="ti ti-folder" style={{ color: '#20ab4b' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{totalProjets}</div>
          <div className="cis-kpi-lbl">Total projets</div>
          <div className="cis-kpi-delta delta-up">
            <i className="ti ti-trending-up" style={{ fontSize: 12 }} aria-hidden="true"></i>
            Portefeuille actif
          </div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: projetsBloques > 0 ? '#fff0f0' : '#f5f5f5' }}>
            <i className="ti ti-alert-triangle" style={{ color: projetsBloques > 0 ? '#ef4444' : '#aaa' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val" style={{ color: projetsBloques > 0 ? '#ef4444' : undefined }}>{projetsBloques}</div>
          <div className="cis-kpi-lbl">Projets bloqués</div>
          <div className={`cis-kpi-delta ${projetsBloques > 0 ? 'delta-warn' : 'delta-neutral'}`}>
            {projetsBloques > 0 ? 'Attention requise' : 'Aucun blocage'}
          </div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: '#e8f0fe' }}>
            <i className="ti ti-chart-pie" style={{ color: '#1a5fb4' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{avancement}%</div>
          <div className="cis-kpi-lbl">Avancement global</div>
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${avancement}%`, height: '100%', background: '#1a5fb4', borderRadius: 2, transition: 'width 0.5s' }}></div>
            </div>
          </div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: '#e8f7ee' }}>
            <i className="ti ti-users" style={{ color: '#20ab4b' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{Object.keys(chargeTravailParIngenieur).length}</div>
          <div className="cis-kpi-lbl">Ingénieurs actifs</div>
          <div className="cis-kpi-delta delta-up">Sur le terrain</div>
        </div>
      </div>

      {/* Grille principale */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Répartition technologique */}
        <div className="cis-card">
          <div className="cis-card-title">
            Répartition technologique
            <span>{Object.values(repartitionParCategorie).reduce((a, b) => a + b, 0)} projets</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(repartitionParCategorie).map(([cat, val]) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#555' }}>
                    {cat === 'SECURITE_RESEAUX' ? 'Sécurité & Réseaux' : 'Infrastructure Système'}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{val}</span>
                </div>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${(val / maxCat) * 100}%`,
                    height: '100%',
                    background: cat === 'SECURITE_RESEAUX' ? '#20ab4b' : '#1a5fb4',
                    borderRadius: 4,
                    transition: 'width 0.5s'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phases */}
        <div className="cis-card">
          <div className="cis-card-title">Analyse par phase</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['PRE_PROJET', 'PROJET', 'POST_PROJET'].map(phase => {
              const count = projetsParPhase[phase] || 0;
              const total = Object.values(projetsParPhase).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              const style = phaseColors[phase];
              const labels = { PRE_PROJET: 'Pré-projet', PROJET: 'En cours', POST_PROJET: 'Clôturé' };
              return (
                <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="cis-badge" style={{ background: style.bg, color: style.color, minWidth: 72 }}>
                    {labels[phase]}
                  </span>
                  <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: style.bar, borderRadius: 4 }}></div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progression des projets */}
      <div className="cis-card" style={{ marginBottom: 16 }}>
        <div className="cis-card-title">
          Progression individuelle des projets
          {Object.entries(avancementParProjet).length > 8 && (
            <button className="cis-btn cis-btn-ghost cis-btn-sm" onClick={() => navigate('/admin/projects/list')}>
              Voir tout →
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topProjets.length === 0 ? (
            <div className="cis-empty"><i className="ti ti-folder-off" aria-hidden="true"></i>Aucun projet trouvé</div>
          ) : (
            topProjets.map(([titre, av]) => (
              <div key={titre}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{titre}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: av >= 100 ? '#20ab4b' : av >= 50 ? '#1a5fb4' : '#ec8549' }}>
                    {av}%
                  </span>
                </div>
                <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${av}%`,
                    height: '100%',
                    background: av >= 100 ? '#20ab4b' : av >= 50 ? '#1a5fb4' : '#ec8549',
                    borderRadius: 3,
                    transition: 'width 0.5s'
                  }}></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Charge par ingénieur */}
      <div className="cis-card">
        <div className="cis-card-title">Charge opérationnelle par ingénieur</div>
        {Object.keys(chargeTravailParIngenieur).length === 0 ? (
          <div className="cis-empty"><i className="ti ti-users-off" aria-hidden="true"></i>Aucun ingénieur actif</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {Object.entries(chargeTravailParIngenieur).map(([ingId, map]) => {
              const total = Object.values(map).reduce((a, b) => a + b, 0);
              const done = map['TERMINE'] || 0;
              const wip = map['EN_COURS'] || 0;
              return (
                <div key={ingId} style={{ padding: '12px 14px', background: '#f9f9f9', borderRadius: 8, border: '1px solid #eee' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>
                    {obtenirNomIngenieur(ingId)}
                  </div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{total} tâche{total > 1 ? 's' : ''} assignée{total > 1 ? 's' : ''}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {wip > 0 && <span className="cis-badge badge-orange">{wip} en cours</span>}
                    {done > 0 && <span className="cis-badge badge-green">{done} terminée{done > 1 ? 's' : ''}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChefProjetDashboard;