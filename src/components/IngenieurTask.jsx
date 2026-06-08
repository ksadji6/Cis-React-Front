import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';

const STATUTS = ['A_FAIRE', 'EN_COURS', 'TERMINE'];
const STATUT_LABEL = { A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINE: 'Terminé' };
const STATUT_BADGE = { A_FAIRE: 'badge-gray', EN_COURS: 'badge-orange', TERMINE: 'badge-green' };
const STATUT_BORDER = { A_FAIRE: '#ddd', EN_COURS: '#ec8549', TERMINE: '#20ab4b'};

export default function IngenieurTask() {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await projectService.getMesTaches();
        if (isMounted) setTaches(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const handleStatusChange = async (task, newStatut) => {
    setUpdatingId(task.id);
    try {
      await projectService.updateTaskStatus(task.projetId, task.id, { ...task, statut: newStatut });
      setTaches(prev => prev.map(t => t.id === task.id ? { ...t, statut: newStatut } : t));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = taches.filter(t => filterStatut ? t.statut === filterStatut : true);

  const nbDone = taches.filter(t => t.statut === 'TERMINE').length;
  const avancement = taches.length ? Math.round((nbDone / taches.length) * 100) : 0;

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:36, height:36, border:'3px solid #ec8549', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div>
      <div className="cis-page-header">
        <div>
          <h1 className="cis-page-title">Mes tâches</h1>
          <p className="cis-page-sub">{taches.length} tâche{taches.length > 1 ? 's' : ''} au total · {avancement}% complété</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="cis-card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontSize:13, fontWeight:600 }}>Ma progression</span>
          <span style={{ fontSize:13, fontWeight:700, color: avancement >= 100 ? '#20ab4b' : '#333' }}>{avancement}%</span>
        </div>
        <div style={{ height:8, background:'#f0f0f0', borderRadius:4, overflow:'hidden' }}>
          <div style={{ width:`${avancement}%`, height:'100%', background: avancement >= 100 ? '#20ab4b' : '#ec8549', borderRadius:4, transition:'width 0.4s' }}></div>
        </div>
        <div style={{ display:'flex', gap:14, marginTop:10, flexWrap:'wrap' }}>
          {STATUTS.map(s => (
            <span key={s} style={{ fontSize:11, color:'#888', display:'flex', alignItems:'center', gap:5 }}>
              <span className={`cis-badge ${STATUT_BADGE[s]}`}>{taches.filter(t => t.statut === s).length}</span>
              {STATUT_LABEL[s]}
            </span>
          ))}
        </div>
      </div>

      {/* Filtre */}
      <div className="cis-filters">
        <select className="cis-filter-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
        </select>
        <span style={{ fontSize:12, color:'#aaa', marginLeft:4, lineHeight:'36px' }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Cartes de tâches */}
      {filtered.length === 0 ? (
        <div className="cis-card">
          <div className="cis-empty">
            <i className="ti ti-list-off" aria-hidden="true"></i>
            Aucune tâche dans cette catégorie
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
          {filtered.map(t => (
            <div key={t.id} style={{
              background:'#fff',
              border:`1px solid ${STATUT_BORDER[t.statut]}`,
              borderRadius:10,
              padding:16,
              boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
              borderLeft:`4px solid ${STATUT_BORDER[t.statut]}`,
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:'#1a1a2a', flex:1, marginRight:8 }}>{t.titre}</h3>
                <span className={`cis-badge ${STATUT_BADGE[t.statut]}`}>{STATUT_LABEL[t.statut]}</span>
              </div>

              {t.description && (
                <p style={{ fontSize:12, color:'#777', marginBottom:10, lineHeight:1.5 }}>{t.description}</p>
              )}

              {(t.dateDebut || t.dateFin) && (
                <div style={{ fontSize:11, color:'#aaa', marginBottom:10, display:'flex', gap:8 }}>
                  {t.dateDebut && <span><i className="ti ti-calendar-event" aria-hidden="true" style={{ marginRight:3 }}></i>{t.dateDebut.substring(0, 10)}</span>}
                  {t.dateFin && <span>→ {t.dateFin.substring(0, 10)}</span>}
                </div>
              )}

              {/* Changer le statut */}
              <div style={{ borderTop:'1px solid #f5f5f5', paddingTop:10, marginTop:4 }}>
                <label style={{ fontSize:11, color:'#aaa', display:'block', marginBottom:5 }}>Mettre à jour le statut :</label>
                <select
                  className="cis-status-select"
                  style={{ width:'100%' }}
                  value={t.statut}
                  disabled={updatingId === t.id}
                  onChange={e => handleStatusChange(t, e.target.value)}
                >
                  {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
                </select>
              </div>

              {updatingId === t.id && (
                <div style={{ fontSize:11, color:'#888', marginTop:6, textAlign:'center' }}>Mise à jour...</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}