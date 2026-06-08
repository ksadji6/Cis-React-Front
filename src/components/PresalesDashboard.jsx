import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';

export default function PresalesDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await projectService.getAll();
        if (isMounted) {
          const preProjet = Array.isArray(data) ? data.filter(p => p.phase === 'PRE_PROJET') : [];
          setProjects(preProjet);
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

  const handleFileUpload = async (projectId, file) => {
    if (!file) return;
    setUploadingId(projectId);
    setUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      await projectService.uploadDocument(projectId, formData);
      setUploadMsg(`Document "${file.name}" uploadé avec succès.`);
      setTimeout(() => setUploadMsg(''), 4000);
    } catch (e) {
      setUploadMsg('Erreur lors de l\'upload. Réessayez. ', e);
    } finally {
      setUploadingId(null);
    }
  };

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const prenom = userData?.user?.prenom || 'Avant-Vente';

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
          <h1 className="cis-page-title">Bonjour, {prenom} 👋</h1>
          <p className="cis-page-sub">Espace avant-vente — Dépôt de documents et suivi des projets pré-phase</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="cis-kpi-grid" style={{ gridTemplateColumns:'repeat(3, 1fr)' }}>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background:'#fef3e8' }}>
            <i className="ti ti-folder" style={{ color:'#ec8549' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">{projects.length}</div>
          <div className="cis-kpi-lbl">Projets en pré-phase</div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background:'#e8f0fe' }}>
            <i className="ti ti-file-upload" style={{ color:'#1a5fb4' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">—</div>
          <div className="cis-kpi-lbl">Documents déposés</div>
        </div>
        <div className="cis-kpi">
          <div className="cis-kpi-icon" style={{ background:'#e8f7ee' }}>
            <i className="ti ti-check" style={{ color:'#20ab4b' }} aria-hidden="true"></i>
          </div>
          <div className="cis-kpi-val">—</div>
          <div className="cis-kpi-lbl">Projets validés</div>
        </div>
      </div>

      {/* Message upload */}
      {uploadMsg && (
        <div className="cis-notice" style={{ marginBottom:16 }}>
          <i className="ti ti-info-circle" aria-hidden="true"></i>
          {uploadMsg}
        </div>
      )}

      {/* Projets pré-phase */}
      <div className="cis-card">
        <div className="cis-card-title">Projets en pré-phase <span>Upload de documents requis</span></div>

        {projects.length === 0 ? (
          <div className="cis-empty">
            <i className="ti ti-folder-off" aria-hidden="true"></i>
            Aucun projet en phase pré-projet pour le moment.
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {projects.map(p => (
              <div key={p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'#f9f9f9', borderRadius:8, border:'1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight:500, fontSize:13 }}>{p.titre || p.nom}</div>
                  <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>
                    {p.categorie === 'SECURITE_RESEAUX' ? 'Sécurité & Réseaux' : 'Infrastructure Système'}
                    {' · '}Créé le {p.dateCreation ? new Date(p.dateCreation).toLocaleDateString('fr-FR') : '—'}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <label style={{
                    display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px',
                    background: uploadingId === p.id ? '#e8f7ee' : '#fff',
                    border:'1px dashed #20ab4b', borderRadius:6, cursor:'pointer',
                    fontSize:12, color:'#20ab4b', fontWeight:500, transition:'background 0.15s'
                  }}>
                    <i className="ti ti-upload" aria-hidden="true"></i>
                    {uploadingId === p.id ? 'Upload...' : 'Déposer un doc'}
                    <input
                      type="file"
                      style={{ display:'none' }}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      disabled={uploadingId === p.id}
                      onChange={e => handleFileUpload(p.id, e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notice */}
      <div className="cis-notice" style={{ marginTop:16 }}>
        <i className="ti ti-info-circle" aria-hidden="true"></i>
        <div>
          <strong>Formats acceptés :</strong> PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx).
          Les documents déposés sont transmis au Chef de Projet pour validation.
        </div>
      </div>
    </div>
  );
}