import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

const ROLES = ['ADMIN', 'CHEF_PROJET', 'INGENIEUR', 'PRESALES', 'SUPERVISEUR'];
const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  CHEF_PROJET: 'Chef de Projet',
  INGENIEUR: 'Ingénieur',
  PRESALES: 'Avant-Vente',
  SUPERVISEUR: 'Superviseur',
};
const ROLE_BADGE = {
  ADMIN: 'badge-yellow',
  CHEF_PROJET: 'badge-green',
  INGENIEUR: 'badge-orange',
  PRESALES: 'badge-blue',
  SUPERVISEUR: 'badge-gray',
};

const EMPTY_FORM = { prenom: '', nom: '', email: '', password: '', role: 'INGENIEUR' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await userService.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(q);
    const matchRole = filterRole ? u.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ prenom: u.prenom, nom: u.nom, email: u.email, password: '', role: u.role });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.prenom || !form.nom || !form.email || (!editingUser && !form.password)) {
      setError('Tous les champs obligatoires doivent être remplis.');
      return;
    }
    setSaving(true);
    setError('');
    
    try {
      if (editingUser) {
        const payload = { prenom: form.prenom, nom: form.nom, email: form.email };
        if (form.password) payload.password = form.password;
        await userService.update(editingUser.id, payload);
        if (form.role !== editingUser.role) {
            await userService.changeRole(editingUser.id, form.role);
        }
      } else {
        const payload = {
          prenom: form.prenom,
          nom: form.nom,
          email: form.email,
          role: form.role,
          password: form.password || "Cis2026!",
          enabled: true,          // <--- OBLIGATOIRE pour éviter l'erreur 500
          isFirstLogin: true
        };
        await userService.create(payload);
      }
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };
  const handleToggleStatus = async (id, enable) => {
  const message = enable ? "Activer ce compte ?" : "Désactiver ce compte ?";
  if (!window.confirm(message)) return;

  try {
    if (enable) {
      await userService.enable(id);
    } else {
      await userService.disable(id);
    }
    // Rafraîchir la liste après le succès
    await load();
  } catch (e) {
    alert('Erreur lors de la mise à jour du statut.');
    console.error(e);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      alert('Erreur lors de la suppression. ', e);
    }
  };

  const initials = (u) => `${u.prenom?.charAt(0) || ''}${u.nom?.charAt(0) || ''}`.toUpperCase();
  const avatarBg = (role) => ({
    ADMIN: '#c8a800', CHEF_PROJET: '#20ab4b', INGENIEUR: '#ec8549',
    PRESALES: '#1a5fb4', SUPERVISEUR: '#555'
  })[role] || '#888';

  return (
    <div>
      {/* Header */}
      <div className="cis-page-header">
        <div>
          <h1 className="cis-page-title">Gestion des utilisateurs</h1>
          <p className="cis-page-sub">{users.length} compte{users.length > 1 ? 's' : ''} au total</p>
        </div>
        <button className="cis-btn cis-btn-primary" onClick={openCreate}>
          <i className="ti ti-user-plus" aria-hidden="true"></i> Ajouter un utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div className="cis-filters">
        <input
          className="cis-filter-input"
          placeholder="🔍  Rechercher par nom, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="cis-filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">Tous les rôles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>

      {/* Tableau */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
          <div style={{ width:32, height:32, border:'3px solid #20ab4b', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}></div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div className="cis-table-wrap">
          <table className="cis-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th style={{ textAlign:'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="cis-empty">
                      <i className="ti ti-users-off" aria-hidden="true"></i>
                      Aucun utilisateur trouvé
                    </div>
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background: avatarBg(u.role), display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:600, flexShrink:0 }}>
                        {initials(u)}
                      </div>
                      <div>
                        <div style={{ fontWeight:500 }}>{u.prenom} {u.nom}</div>
                        <div style={{ fontSize:11, color:'#aaa' }}>ID #{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color:'#555' }}>{u.email}</td>
                  <td><span className={`cis-badge ${ROLE_BADGE[u.role]}`}>{ROLE_LABELS[u.role] || u.role}</span></td>
                  <td>
                    <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
                      <button className="cis-btn cis-btn-ghost cis-btn-sm" onClick={() => openEdit(u)}>
                        <i className="ti ti-edit" aria-hidden="true"></i> Modifier
                      </button>
                      {/* Boutons Activation / Désactivation */}
                    {u.enabled ? (
                      <button 
                        className="cis-btn cis-btn-danger cis-btn-sm" 
                        onClick={() => handleToggleStatus(u.id, false)}
                        title="Désactiver le compte"
                      >
                        <i className="ti ti-user-off"></i>
                      </button>
                    ) : (
                      <button 
                        className="cis-btn cis-btn-success cis-btn-sm" 
                        onClick={() => handleToggleStatus(u.id, true)}
                        title="Activer le compte"
                      >
                        <i className="ti ti-user-check"></i>
                      </button>
                      )}
                      <button className="cis-btn cis-btn-danger cis-btn-sm" onClick={() => handleDelete(u.id)}>
                        <i className="ti ti-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:12, padding:28, width:460, boxShadow:'0 8px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:16, fontWeight:600 }}>
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#888' }}>✕</button>
            </div>

            {error && (
              <div style={{ background:'#fff0f0', border:'1px solid #fcc', borderRadius:6, padding:'8px 12px', marginBottom:14, fontSize:12, color:'#c0392b' }}>
                {error}
              </div>
            )}

            <div className="cis-grid-2">
              <div className="cis-form-group">
                <label className="cis-label">Prénom *</label>
                <input className="cis-input" value={form.prenom} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))} placeholder="Prénom" />
              </div>
              <div className="cis-form-group">
                <label className="cis-label">Nom *</label>
                <input className="cis-input" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} placeholder="Nom" />
              </div>
            </div>

            <div className="cis-form-group">
              <label className="cis-label">Email *</label>
              <input className="cis-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="adresse@cis-si.com" />
            </div>

            <div className="cis-form-group">
              <label className="cis-label">{editingUser ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *'}</label>
              <input className="cis-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
            </div>

            <div className="cis-form-group">
              <label className="cis-label">Rôle *</label>
              <select className="cis-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>

            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
              <button className="cis-btn cis-btn-gray" onClick={() => setShowForm(false)}>Annuler</button>
              <button className="cis-btn cis-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Sauvegarde...' : editingUser ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}