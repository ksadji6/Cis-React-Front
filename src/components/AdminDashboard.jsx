import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [s, u] = await Promise.all([
          projectService.getDashboardStats(),
          userService.getAll()
        ]);
        if (isMounted) {
          setStats(s || {});
          setUsers(Array.isArray(u) ? u : []);
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
      <p style={{ color:'#888', fontSize:13 }}>Chargement du tableau de bord...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const totalProjets = stats?.totalProjets || 0;
  const projetsBloques = stats?.projetsBloques || 0;
  const avancement = Math.round(stats?.avancementMoyenGlobal || 0);
  const projetsParPhase = stats?.projetsParPhase || {};
  const repartition = stats?.repartitionParCategorie || {};

  const totalUsers = users.length;
  const chefs = users.filter(u => u.role === 'CHEF_PROJET').length;
  const ingenieurs = users.filter(u => u.role === 'INGENIEUR').length;

  const accesRapides = [
    { icon: 'ti-users', label: 'Gérer les utilisateurs', sub: `${totalUsers} comptes actifs`, color: '#20ab4b', bg: '#e8f7ee', path: '/admin/users' },
    { icon: 'ti-folder', label: 'Tous les projets', sub: `${totalProjets} projets au total`, color: '#1a5fb4', bg: '#e8f0fe', path: '/admin/projects/list' },
    { icon: 'ti-plus', label: 'Créer un projet', sub: 'Nouveau dossier', color: '#ec8549', bg: '#fef3e8', path: '/admin/projects/create' },
  ];

  const phaseLabels = { PRE_PROJET: 'Pré-projet', PROJET: 'En cours', POST_PROJET: 'Clôturé' };
  const phaseColors = { PRE_PROJET: '#ec8549', PROJET: '#20ab4b', POST_PROJET: '#1a5fb4' };

  return (
    <div>
      <div className="cis-page-header">
        <div>
          <h1 className="cis-page-title">Administration</h1>
          <p className="cis-page-sub">Vue d'ensemble de la plateforme CIS Integration</p>
        </div>
        <button className="cis-btn cis-btn-primary" onClick={() => navigate('/admin/projects/create')}>
          <i className="ti ti-plus" aria-hidden="true"></i> Nouveau projet
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
          <div className="cis-kpi-delta delta-up"><i className="ti ti-trending-up" style={{ fontSize:12 }}></i> Portefeuille</div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: projetsBloques > 0 ? '#fff0f0' : '#f5f5f5' }}>
            <i className="ti ti-alert-triangle" style={{ color: projetsBloques > 0 ? '#ef4444' : '#aaa' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val" style={{ color: projetsBloques > 0 ? '#ef4444' : undefined }}>{projetsBloques}</div>
          <div className="cis-kpi-lbl">Projets bloqués</div>
          <div className={`cis-kpi-delta ${projetsBloques > 0 ? 'delta-warn' : 'delta-neutral'}`}>
            {projetsBloques > 0 ? 'À traiter' : 'Aucun blocage'}
          </div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: '#e8f0fe' }}>
            <i className="ti ti-chart-pie" style={{ color: '#1a5fb4' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{avancement}%</div>
          <div className="cis-kpi-lbl">Avancement global</div>
          <div style={{ marginTop:8, height:4, background:'#f0f0f0', borderRadius:2, overflow:'hidden' }}>
            <div style={{ width:`${avancement}%`, height:'100%', background:'#1a5fb4', borderRadius:2 }}></div>
          </div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: '#e8f7ee' }}>
            <i className="ti ti-users" style={{ color: '#20ab4b' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{totalUsers}</div>
          <div className="cis-kpi-lbl">Utilisateurs</div>
          <div className="cis-kpi-delta delta-up">{chefs} CP · {ingenieurs} Ing.</div>
        </div>
      </div>

      {/* Accès rapides */}
      <div style={{ marginBottom:16 }}>
        <p style={{ fontSize:12, color:'#aaa', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:10 }}>Accès rapides</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
          {accesRapides.map(a => (
            <button key={a.path} onClick={() => navigate(a.path)}
              style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'16px 18px', cursor:'pointer', display:'flex', alignItems:'center', gap:14, textAlign:'left', transition:'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
            >
              <div style={{ width:42, height:42, borderRadius:10, background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={`ti ${a.icon}`} style={{ color:a.color, fontSize:20 }} aria-hidden="true"></i>
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:'#1a1a2a' }}>{a.label}</div>
                <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bas de page : répartition + phases */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div className="cis-card">
          <div className="cis-card-title">Répartition par catégorie</div>
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
                    <div style={{ width:`${(v / totalProjets) * 100}%`, height:'100%', background: cat === 'SECURITE_RESEAUX' ? '#20ab4b' : '#1a5fb4', borderRadius:4 }}></div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="cis-card">
          <div className="cis-card-title">Projets par phase</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {['PRE_PROJET', 'PROJET', 'POST_PROJET'].map(phase => {
              const count = projetsParPhase[phase] || 0;
              const pct = totalProjets ? Math.round((count / totalProjets) * 100) : 0;
              return (
                <div key={phase} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:11, minWidth:76, color: phaseColors[phase], fontWeight:600 }}>{phaseLabels[phase]}</span>
                  <div style={{ flex:1, height:8, background:'#f0f0f0', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:phaseColors[phase], borderRadius:4 }}></div>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, minWidth:20 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}