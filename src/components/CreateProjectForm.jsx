import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';

const CATEGORIES = [
  { value: 'SECURITE_RESEAUX', label: 'Sécurité & Réseaux' },
  { value: 'INFRASTRUCTURE_SYSTEME', label: 'Infrastructure Système' },
];

export default function CreateProjectForm() {
  const navigate = useNavigate();

  // ─── Données utilisateur connecté ────────────────────────────────
  const currentUser = useMemo(() => {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  }, []);
  const isChefProjet = currentUser?.user?.role === 'CHEF_PROJET';

  // ─── Formulaire ──────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorie: 'SECURITE_RESEAUX',
    chefProjetId: '',
    dateDebut: '',
    dateFin: '',
  });
  const [chefs, setChefs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAll();
        const chefsOnly = users.filter(u => u.role === 'CHEF_PROJET');
        setChefs(chefsOnly);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
    if (isChefProjet && currentUser?.user?.id) {
      setFormData(prev => ({ ...prev, chefProjetId: currentUser.user.id }));
    }
  }, []);  // eslint-disable-line

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loggedInId = currentUser?.user?.id;
    const chefIdFinal = isChefProjet ? loggedInId : formData.chefProjetId;
    if (!formData.titre) { setError('Le titre est obligatoire.'); return; }
    if (!chefIdFinal) { setError('Veuillez sélectionner un Chef de Projet.'); return; }

    const finalChefIdParsed = parseInt(chefIdFinal, 10);
    if (isNaN(finalChefIdParsed)) { setError('ID Chef de Projet invalide.'); return; }

    setSaving(true);
    setError('');
    try {
      await projectService.create({
        ...formData,
        chefProjetId: finalChefIdParsed,
      });
      navigate('/admin/projects/list');
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur lors de la création du projet.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth:680 }}>
      <div className="cis-page-header">
        <div>
          <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:12, marginBottom:6, display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-arrow-left" aria-hidden="true"></i> Retour
          </button>
          <h1 className="cis-page-title">Nouveau projet</h1>
          <p className="cis-page-sub">Renseignez les informations du projet à créer</p>
        </div>
      </div>

      <div className="cis-card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background:'#fff0f0', border:'1px solid #fcc', borderRadius:8, padding:'10px 14px', marginBottom:18, fontSize:12, color:'#c0392b', display:'flex', gap:8, alignItems:'center' }}>
              <i className="ti ti-alert-circle" aria-hidden="true"></i>
              {error}
            </div>
          )}

          {/* Titre */}
          <div className="cis-form-group">
            <label className="cis-label">Titre du projet *</label>
            <input
              className="cis-input"
              value={formData.titre}
              onChange={e => handleChange('titre', e.target.value)}
              placeholder="Ex: Déploiement firewall Palo Alto — Client X"
            />
          </div>

          {/* Description */}
          <div className="cis-form-group">
            <label className="cis-label">Description</label>
            <textarea
              className="cis-textarea"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Contexte, objectifs, périmètre du projet..."
              style={{ minHeight:90 }}
            />
          </div>

          {/* Catégorie */}
          <div className="cis-form-group">
            <label className="cis-label">Catégorie *</label>
            <div style={{ display:'flex', gap:10 }}>
              {CATEGORIES.map(c => (
                <label key={c.value} style={{
                  flex:1, padding:'12px 16px', border:`2px solid ${formData.categorie === c.value ? '#20ab4b' : '#ddd'}`,
                  borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', gap:10,
                  background: formData.categorie === c.value ? '#e8f7ee' : '#fafafa',
                  transition:'border-color 0.15s, background 0.15s',
                }}>
                  <input
                    type="radio"
                    name="categorie"
                    value={c.value}
                    checked={formData.categorie === c.value}
                    onChange={() => handleChange('categorie', c.value)}
                    style={{ display:'none' }}
                  />
                  <i className={`ti ${c.value === 'SECURITE_RESEAUX' ? 'ti-shield' : 'ti-server'}`}
                    style={{ color: formData.categorie === c.value ? '#20ab4b' : '#aaa', fontSize:18 }} aria-hidden="true"></i>
                  <span style={{ fontSize:13, fontWeight:500, color: formData.categorie === c.value ? '#1a6b38' : '#555' }}>{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Chef de Projet */}
          {!isChefProjet && (
            <div className="cis-form-group">
              <label className="cis-label">Chef de Projet *</label>
              <select
                className="cis-select"
                value={formData.chefProjetId}
                onChange={e => handleChange('chefProjetId', e.target.value)}
              >
                <option value="">— Sélectionner un chef de projet —</option>
                {chefs.map(u => (
                  <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                ))}
              </select>
            </div>
          )}

          {isChefProjet && (
            <div className="cis-notice" style={{ marginBottom:16 }}>
              <i className="ti ti-user-check" aria-hidden="true"></i>
              Vous serez automatiquement assigné(e) comme Chef de Projet.
            </div>
          )}

          {/* Dates */}
          <div className="cis-grid-2">
            <div className="cis-form-group">
              <label className="cis-label">Date de début</label>
              <input
                className="cis-input"
                type="date"
                value={formData.dateDebut}
                onChange={e => handleChange('dateDebut', e.target.value)}
              />
            </div>
            <div className="cis-form-group">
              <label className="cis-label">Date de fin prévue</label>
              <input
                className="cis-input"
                type="date"
                value={formData.dateFin}
                onChange={e => handleChange('dateFin', e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="cis-divider"></div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button type="button" className="cis-btn cis-btn-gray" onClick={() => navigate(-1)}>
              Annuler
            </button>
            <button type="submit" className="cis-btn cis-btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.5)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}></div>
                  Création...
                </>
              ) : (
                <>
                  <i className="ti ti-plus" aria-hidden="true"></i>
                  Créer le projet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}