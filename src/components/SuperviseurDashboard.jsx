import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';

export default function SuperviseurDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [s, u, p] = await Promise.all([
          projectService.getDashboardStats(),
          userService.getAll(),
          projectService.getAll()
        ]);
        if (isMounted) {
          setStats(s || {});
          setUsers(Array.isArray(u) ? u : []);
          setProjects(Array.isArray(p) ? p : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:36, height:36, border:'3px solid #20ab4b', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const totalProjets = stats?.totalProjets || 0;
  const projetsBloques = stats?.projetsBloques || 0;
  const avancement = Math.round(stats?.avancementMoyenGlobal || 0);
  const projetsParPhase = stats?.projetsParPhase || {};
  const avancementParProjet = stats?.avancementParProjet || {};
  const chargeTravail = stats?.chargeTravailParIngenieur || {};

  const totalUsers = users.length;
  const ingenieurs = users.filter(u => u.role === 'INGENIEUR').length;
  const chefs = users.filter(u => u.role === 'CHEF_PROJET').length;

  const topProjets = Object.entries(avancementParProjet)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const repartition = stats?.repartitionParCategorie || {};

  const phaseColors = { PRE_PROJET: '#ec8549', PROJET: '#20ab4b', POST_PROJET: '#1a5fb4' };
  const phaseLabels = { PRE_PROJET: 'Pré-projet', PROJET: 'En cours', POST_PROJET: 'Clôturé' };

  return (
    <div>
      <div className="cis-page-header">
        <div>
          <h1 className="cis-page-title">Supervision</h1>
          <p className="cis-page-sub">Vue consolidée de l'activité CIS Integration</p>
        </div>
        <div style={{ fontSize:12, color:'#aaa' }}>
          Mis à jour le {new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="cis-kpi-grid">
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background:'#e8f7ee' }}>
            <i className="ti ti-folder" style={{ color:'#20ab4b' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{totalProjets}</div>
          <div className="cis-kpi-lbl">Total projets</div>
          <div className="cis-kpi-delta delta-up">Portefeuille actif</div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background:'#e8f0fe' }}>
            <i className="ti ti-chart-pie" style={{ color:'#1a5fb4' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{avancement}%</div>
          <div className="cis-kpi-lbl">Avancement global</div>
          <div style={{ marginTop:8, height:4, background:'#f0f0f0', borderRadius:2, overflow:'hidden' }}>
            <div style={{ width:`${avancement}%`, height:'100%', background:'#1a5fb4', borderRadius:2 }}></div>
          </div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: projetsBloques > 0 ? '#fff0f0' : '#f5f5f5' }}>
            <i className="ti ti-alert-triangle" style={{ color: projetsBloques > 0 ? '#ef4444' : '#aaa' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val" style={{ color: projetsBloques > 0 ? '#ef4444' : undefined }}>{projetsBloques}</div>
          <div className="cis-kpi-lbl">Projets bloqués</div>
          <div className={`cis-kpi-delta ${projetsBloques > 0 ? 'delta-warn' : 'delta-neutral'}`}>
            {projetsBloques > 0 ? 'Escalade requise' : 'Aucun blocage'}
          </div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background:'#e8f7ee' }}>
            <i className="ti ti-users" style={{ color:'#20ab4b' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{totalUsers}</div>
          <div className="cis-kpi-lbl">Effectif total</div>
          <div className="cis-kpi-delta delta-neutral">{chefs} CP · {ingenieurs} Ing.</div>
        </div>
      </div>

      {/* Grille rapports */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

        {/* Projets par phase */}
        <div className="cis-card">
          <div className="cis-card-title">Répartition par phase</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {['PRE_PROJET', 'PROJET', 'POST_PROJET'].map(phase => {
              const count = projetsParPhase[phase] || 0;
              const pct = totalProjets ? Math.round((count / totalProjets) * 100) : 0;
              return (
                <div key={phase}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'#555' }}>{phaseLabels[phase]}</span>
                    <span style={{ fontSize:12, fontWeight:600 }}>{count} <span style={{ color:'#aaa', fontWeight:400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height:8, background:'#f0f0f0', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:phaseColors[phase], borderRadius:4 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Répartition technologique */}
        <div className="cis-card">
          <div className="cis-card-title">Répartition technologique</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {Object.entries(repartition).length === 0
              ? <div className="cis-empty">Aucune donnée</div>
              : Object.entries(repartition).map(([cat, v]) => (
                <div key={cat}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'#555' }}>
                      {cat === 'SECURITE_RESEAUX' ? 'Sécurité & Réseaux' : 'Infrastructure Système'}
                    </span>
                    <span style={{ fontSize:12, fontWeight:600 }}>{v}</span>
                  </div>
                  <div style={{ height:8, background:'#f0f0f0', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ width:`${totalProjets ? (v / totalProjets) * 100 : 0}%`, height:'100%', background: cat === 'SECURITE_RESEAUX' ? '#20ab4b' : '#1a5fb4', borderRadius:4 }}></div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Progression des projets */}
      <div className="cis-card" style={{ marginBottom:16 }}>
        <div className="cis-card-title">Avancement des projets <span>Top 6</span></div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {topProjets.length === 0
            ? <div className="cis-empty">Aucune donnée de progression</div>
            : topProjets.map(([titre, av]) => (
              <div key={titre} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:12, color:'#333', minWidth:180, flexShrink:0, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {titre}
                </span>
                <div style={{ flex:1, height:8, background:'#f0f0f0', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ width:`${av}%`, height:'100%', background: av >= 100 ? '#20ab4b' : av >= 50 ? '#1a5fb4' : '#ec8549', borderRadius:4 }}></div>
                </div>
                <span style={{ fontSize:12, fontWeight:600, minWidth:36, textAlign:'right', color: av >= 100 ? '#20ab4b' : '#333' }}>{av}%</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Charge ingénieurs */}
      <div className="cis-card">
        <div className="cis-card-title">Charge de travail par ingénieur</div>
        {Object.keys(chargeTravail).length === 0
          ? <div className="cis-empty"><i className="ti ti-users-off" aria-hidden="true"></i>Aucun ingénieur actif</div>
          : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:10 }}>
              {Object.entries(chargeTravail).map(([ingId, map]) => {
                const total = Object.values(map).reduce((a, b) => a + b, 0);
                const done = map['TERMINE'] || 0;
                const wip = map['EN_COURS'] || 0;
                const bloque = map['BLOQUE'] || 0;
                const u = users.find(u => u.id === parseInt(ingId, 10));
                const name = u ? `${u.prenom} ${u.nom}` : `#${ingId}`;
                return (
                  <div key={ingId} style={{ padding:'12px 14px', background:'#f9f9f9', borderRadius:8, border:'1px solid #eee' }}>
                    <div style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{name}</div>
                    <div style={{ fontSize:11, color:'#888', marginBottom:8 }}>{total} tâche{total > 1 ? 's' : ''}</div>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {wip > 0 && <span className="cis-badge badge-orange">{wip} en cours</span>}
                      {done > 0 && <span className="cis-badge badge-green">{done} faite{done > 1 ? 's' : ''}</span>}
                      {bloque > 0 && <span className="cis-badge badge-red">{bloque} bloquée{bloque > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>
    </div>
  );
}