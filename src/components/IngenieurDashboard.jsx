import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';

const STATUT_LABEL = { A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINE: 'Terminé', BLOQUE: 'Bloqué' };
const STATUT_BADGE = { A_FAIRE: 'badge-gray', EN_COURS: 'badge-orange', TERMINE: 'badge-green', BLOQUE: 'badge-red' };

export default function IngenieurDashboard() {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const user = userData?.user;
  const prenom = user?.prenom || 'Ingénieur';

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await projectService.getMyTasks();
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

  const nbTotal = taches.length;
  const nbEnCours = taches.filter(t => t.statut === 'EN_COURS').length;
  const nbTermine = taches.filter(t => t.statut === 'TERMINE').length;
  const nbBloque = taches.filter(t => t.statut === 'BLOQUE').length;
  const avancement = nbTotal ? Math.round((nbTermine / nbTotal) * 100) : 0;

  const tachesUrgentes = taches.filter(t => t.statut !== 'TERMINE').slice(0, 5);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:36, height:36, border:'3px solid #ec8549', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="cis-page-header">
        <div>
          <h1 className="cis-page-title">Bonjour, {prenom} 👋</h1>
          <p className="cis-page-sub">Voici votre espace de travail — {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}</p>
        </div>
        <button className="cis-btn cis-btn-orange" onClick={() => navigate('/ingenieur/taches')}>
          <i className="ti ti-list-check" aria-hidden="true"></i> Voir toutes mes tâches
        </button>
      </div>

      {/* KPIs */}
      <div className="cis-kpi-grid">
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background:'#fef3e8' }}>
            <i className="ti ti-list-check" style={{ color:'#ec8549' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{nbTotal}</div>
          <div className="cis-kpi-lbl">Tâches assignées</div>
          <div className="cis-kpi-delta delta-neutral">Total du portefeuille</div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background:'#fef3e8' }}>
            <i className="ti ti-player-play" style={{ color:'#ec8549' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{nbEnCours}</div>
          <div className="cis-kpi-lbl">En cours</div>
          <div className="cis-kpi-delta delta-warn">À livrer prochainement</div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background:'#e8f7ee' }}>
            <i className="ti ti-circle-check" style={{ color:'#20ab4b' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{nbTermine}</div>
          <div className="cis-kpi-lbl">Terminées</div>
          <div style={{ marginTop:8, height:4, background:'#f0f0f0', borderRadius:2, overflow:'hidden' }}>
            <div style={{ width:`${avancement}%`, height:'100%', background:'#20ab4b', borderRadius:2 }}></div>
          </div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background: nbBloque > 0 ? '#fff0f0' : '#f5f5f5' }}>
            <i className="ti ti-ban" style={{ color: nbBloque > 0 ? '#ef4444' : '#aaa' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val" style={{ color: nbBloque > 0 ? '#ef4444' : undefined }}>{nbBloque}</div>
          <div className="cis-kpi-lbl">Bloquées</div>
          <div className={`cis-kpi-delta ${nbBloque > 0 ? 'delta-warn' : 'delta-neutral'}`}>
            {nbBloque > 0 ? 'Signaler au CP' : 'Aucun blocage'}
          </div>
        </div>
      </div>

      {/* Tâches actives */}
      <div className="cis-card">
        <div className="cis-card-title">
          Tâches actives
          <button className="cis-btn cis-btn-ghost cis-btn-sm" onClick={() => navigate('/ingenieur/taches')}>
            Toutes → 
          </button>
        </div>
        {tachesUrgentes.length === 0 ? (
          <div className="cis-empty">
            <i className="ti ti-circle-check" aria-hidden="true"></i>
            Tout est à jour ! Aucune tâche en attente.
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {tachesUrgentes.map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'#f9f9f9', borderRadius:8, border:'1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight:500, fontSize:13 }}>{t.titre}</div>
                  {t.dateFin && (
                    <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>
                      Échéance : {t.dateFin.substring(0, 10)}
                    </div>
                  )}
                </div>
                <span className={`cis-badge ${STATUT_BADGE[t.statut]}`}>{STATUT_LABEL[t.statut]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}