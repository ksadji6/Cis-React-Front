import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';

const STATUTS = ['A_FAIRE', 'EN_COURS', 'TERMINE'];
const STATUT_LABEL = { A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINE: 'Terminé'};
const STATUT_BADGE = { A_FAIRE: 'badge-gray', EN_COURS: 'badge-orange', TERMINE: 'badge-green' };

const EMPTY_FORM = { intitule: '', description: '', assigneA: '', statut: 'A_FAIRE', dateDebut: '', dateFin: '' };

export default function TaskManager() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [ingenieurs, setIngénieurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      const [proj, taches, users] = await Promise.all([
        projectService.getById(projectId),
        projectService.getTasks(projectId),
        userService.getAll()
      ]);
      setProject(proj);
      setTasks(Array.isArray(taches) ? taches : []);
      setIngénieurs(Array.isArray(users) ? users.filter(u => u.role === 'INGENIEUR') : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const userName = (id) => {
    const u = ingenieurs.find(u => u.id === id || u.id === parseInt(id, 10));
    return u ? `${u.prenom} ${u.nom}` : id ? `#${id}` : '—';
  };

  const openCreate = () => {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditingTask(t);
    setForm({
      intitule: t.titre || t.intitule || '',
      description: t.description || '',
      assigneA: t.assigneA || t.ingenieurId || '',
      statut: t.statut || 'A_FAIRE',
      dateDebut: t.dateDebut ? t.dateDebut.substring(0, 10) : '',
      dateFin: t.dateFin ? t.dateFin.substring(0, 10) : '',
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.intitule) { setError('Le titre est obligatoire.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        intitule: form.intitule, 
        description: form.description,
        ingenieurId: form.assigneA ? parseInt(form.assigneA, 10) : null,
        statut: form.statut,
        dateCreation: form.dateDebut ? new Date(form.dateDebut).toISOString() : new Date().toISOString(),
        dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null
      };
      if (editingTask) {
        await projectService.updateTask(editingTask.id, payload);
      } else {
        await projectService.createTask(projectId, payload);
      }
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, newStatut) => {
    try {
      await projectService.updateTaskStatus(task.id, newStatut);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, statut: newStatut } : t));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    try {
      await projectService.deleteTask(projectId, id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch { alert('Erreur.'); }
  };

  const filtered = tasks.filter(t => filterStatut ? t.statut === filterStatut : true);
  const nbDone = tasks.filter(t => t.statut === 'TERMINE').length;
  const avancement = tasks.length ? Math.round((nbDone / tasks.length) * 100) : 0;

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:36, height:36, border:'3px solid #20ab4b', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="cis-page-header">
        <div>
          <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:12, marginBottom:6, display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-arrow-left" aria-hidden="true"></i> Retour
          </button>
          <h1 className="cis-page-title">{project?.titre || project?.nom || 'Gestion des tâches'}</h1>
          <p className="cis-page-sub">{tasks.length} tâche{tasks.length > 1 ? 's' : ''} · {avancement}% complété</p>
        </div>
        <button className="cis-btn cis-btn-primary" onClick={openCreate}>
          <i className="ti ti-plus" aria-hidden="true"></i> Nouvelle tâche
        </button>
      </div>

      {/* Barre de progression globale */}
      <div className="cis-card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontSize:13, fontWeight:600 }}>Avancement du projet</span>
          <span style={{ fontSize:13, fontWeight:700, color: avancement >= 100 ? '#20ab4b' : '#333' }}>{avancement}%</span>
        </div>
        <div style={{ height:10, background:'#f0f0f0', borderRadius:5, overflow:'hidden' }}>
          <div style={{ width:`${avancement}%`, height:'100%', background: avancement >= 100 ? '#20ab4b' : '#1a5fb4', borderRadius:5, transition:'width 0.5s' }}></div>
        </div>
        <div style={{ display:'flex', gap:16, marginTop:10 }}>
          {STATUTS.map(s => {
            const count = tasks.filter(t => t.statut === s).length;
            return (
              <span key={s} style={{ fontSize:11, color:'#888' }}>
                <span className={`cis-badge ${STATUT_BADGE[s]}`}>{count}</span>{' '}
                {STATUT_LABEL[s]}
              </span>
            );
          })}
        </div>
      </div>

      {/* Filtre */}
      <div className="cis-filters">
        <select className="cis-filter-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
        </select>
      </div>

      {/* Tableau des tâches */}
      <div className="cis-table-wrap">
        <table className="cis-table">
          <thead>
            <tr>
              <th>Tâche</th>
              <th>Assigné à</th>
              <th>Période</th>
              <th>Statut</th>
              <th style={{ textAlign:'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="cis-empty">
                    <i className="ti ti-list-off" aria-hidden="true"></i>
                    Aucune tâche trouvée
                  </div>
                </td>
              </tr>
            ) : filtered.map(t => (
              <tr key={t.id}>
                <td>
                  <div style={{ fontWeight:500 }}>{t.intitule}</div>
                  {t.description && (
                    <div style={{ fontSize:11, color:'#aaa', marginTop:2, maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {t.description}
                    </div>
                  )}
                </td>
                <td style={{ fontSize:12 }}>{userName(t.assigneA || t.ingenieurId)}</td>
                <td style={{ fontSize:11, color:'#888' }}>
                  {t.dateCreation ? t.dateCreation.substring(0, 10) : '—'}
                  {t.dateFin ? ` → ${t.dateFin.substring(0, 10)}` : ' → Pas de date'}
                </td>
                <td>
                  <select
                    className="cis-status-select"
                    value={t.statut}
                    onChange={e => handleStatusChange(t, e.target.value)}
                    style={{
                      borderColor: t.statut === 'TERMINE' ? '#20ab4b' : t.statut === 'EN_COURS' ?  '#d48402' : '#ddd',
                      color: t.statut === 'TERMINE' ? '#1a6b38' : t.statut === 'EN_COURS' ?  '#d48402' : '#555',
                      background: t.statut === 'TERMINE' ? '#e8f7ee' : t.statut === 'EN_COURS' ?  '#fff0f0' : '#f5f5f5',
                    }}
                  >
                    {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
                  </select>
                </td>
                <td>
                  <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
                    <button className="cis-btn cis-btn-ghost cis-btn-sm" onClick={() => openEdit(t)}>
                      <i className="ti ti-edit" aria-hidden="true"></i>
                    </button>
                    <button className="cis-btn cis-btn-danger cis-btn-sm" onClick={() => handleDelete(t.id)}>
                      <i className="ti ti-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:12, padding:28, width:500, boxShadow:'0 8px 32px rgba(0,0,0,0.15)', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:16, fontWeight:600 }}>{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#888' }}>✕</button>
            </div>

            {error && (
              <div style={{ background:'#fff0f0', border:'1px solid #fcc', borderRadius:6, padding:'8px 12px', marginBottom:14, fontSize:12, color:'#c0392b' }}>
                {error}
              </div>
            )}

            <div className="cis-form-group">
              <label className="cis-label">Titre *</label>
              <input className="cis-input" value={form.intitule} onChange={e => setForm(p => ({ ...p, intitule: e.target.value }))} placeholder="Titre de la tâche" />
            </div>
            <div className="cis-form-group">
              <label className="cis-label">Description</label>
              <textarea className="cis-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description optionnelle..." />
            </div>
            <div className="cis-grid-2">
              <div className="cis-form-group">
                <label className="cis-label">Assigner à</label>
                <select className="cis-select" value={form.assigneA} onChange={e => setForm(p => ({ ...p, assigneA: e.target.value }))}>
                  <option value="">— Non assigné —</option>
                  {ingenieurs.map(u => <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>)}
                </select>
              </div>
              <div className="cis-form-group">
                <label className="cis-label">Statut</label>
                <select className="cis-select" value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))}>
                  {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
                </select>
              </div>
            </div>
            <div className="cis-grid-2">
              <div className="cis-form-group">
                <label className="cis-label">Date début</label>
                <input className="cis-input" type="date" value={form.dateDebut} onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))} />
              </div>
              <div className="cis-form-group">
                <label className="cis-label">Date fin</label>
                <input className="cis-input" type="date" value={form.dateFin} onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))} />
              </div>
            </div>

            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
              <button className="cis-btn cis-btn-gray" onClick={() => setShowForm(false)}>Annuler</button>
              <button className="cis-btn cis-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Sauvegarde...' : editingTask ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}