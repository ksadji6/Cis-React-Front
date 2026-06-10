import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';

const PHASE_BADGE = {
  PRE_PROJET: { cls: 'badge-orange', label: 'Pré-projet' },
  PROJET: { cls: 'badge-green', label: 'En cours' },
  POST_PROJET: { cls: 'badge-blue', label: 'Clôturé' },
};

const CAT_LABEL = {
  SECURITE_RESEAUX: 'Sécurité & Réseaux',
  INFRASTRUCTURE_SYSTEME: 'Infrastructure Système',
};

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPhase, setFilterPhase] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'))?.user;
  const userRole = user?.role;

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
        try {
            const u = await userService.getAll();
            setUsers(Array.isArray(u) ? u : []);

            let p = [];
            // Logique de filtrage par rôle côté client pour plus de simplicité
            const all = await projectService.getAllProjects();
            
            if (userRole === 'CHEF_PROJET') {
                p = all.filter(proj => proj.chefProjetId === user.id);
            } else if (userRole === 'PRESALES') {
                // Le presales ne voit que ses projets
                p = all.filter(proj => proj.presalesId === user.id);
            } else {
                // Admin, Superviseur voient tout
                p = all;
            }

            if (isMounted) setProjects(Array.isArray(p) ? p : []);
        } catch (e) {
            console.error(e);
        } finally {
            if (isMounted) setLoading(false);
        }
    };
    load();
    return () => { isMounted = false; };
}, [userRole, user.id]);

  const userName = (id) => {
    const u = users.find(u => u.id === id);
    return u ? `${u.prenom} ${u.nom}` : '—';
  };

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = (p.titre || p.nom || '').toLowerCase().includes(q);
    const matchPhase = filterPhase ? p.phase === filterPhase : true;
    const matchCat = filterCat ? p.categorie === filterCat : true;
    return matchSearch && matchPhase && matchCat;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce projet ?')) return;
    try {
      await projectService.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div>
      <div className="cis-page-header">
        <div>
          <h1 className="cis-page-title">Projets & Tâches</h1>
          <p className="cis-page-sub">{projects.length} projet{projects.length > 1 ? 's' : ''} dans le portefeuille</p>
        </div>
        {(userRole=== 'CHEF_PROJET' || userRole=== 'ADMIN' ) && (
          <>
        <button className="cis-btn cis-btn-primary" onClick={() => navigate('/admin/projects/create')}>
          <i className="ti ti-plus" aria-hidden="true"></i> Nouveau projet
        </button>
        </>)}
      </div>
      
      {/* Filtres */}
      <div className="cis-filters">
        <input
          className="cis-filter-input"
          placeholder="🔍  Rechercher un projet..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="cis-filter-select" value={filterPhase} onChange={e => setFilterPhase(e.target.value)}>
          <option value="">Toutes les phases</option>
          <option value="PRE_PROJET">Pré-projet</option>
          <option value="PROJET">En cours</option>
          <option value="POST_PROJET">Clôturé</option>
        </select>
        <select className="cis-filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">Toutes les catégories</option>
          <option value="SECURITE_RESEAUX">Sécurité & Réseaux</option>
          <option value="INFRASTRUCTURE_SYSTEME">Infrastructure Système</option>
        </select>
        <select className="cis-filter-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="EN_COURS">En cours</option>
            <option value="BLOQUE">Bloqué</option>
            <option value="TERMINE">Terminé</option>
        </select>
      </div>

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
                <th>Projet</th>
                <th>Phase</th>
                <th>Statut</th>
                <th>Catégorie</th>
                <th>Chef de Projet</th>
                
                <th>Avancement</th>
                {(userRole!== 'PRESALES' ) && (
                <>
                <th style={{ textAlign:'right' }}>Actions</th>
                </>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="cis-empty">Aucun projet trouvé</div></td></tr>
              ) : filtered.map(p => {
                const avancement = typeof p.avancement === 'number' ? p.avancement : 0;
                const phase = PHASE_BADGE[p.phase] || { cls: 'badge-gray', label: p.phase };
                
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate(`/admin/projects/${p.id}`)} >{p.titre || p.nom}</div>
                      {p.description && <div style={{ fontSize: 11, color: '#aaa' }}>{p.description}</div>}
                    </td>
                    <td><span className={`cis-badge ${phase.cls}`}>{phase.label}</span></td>
                    <td>
                      <span className={`cis-badge status-${p.statut?.toLowerCase()}`}>
                        {p.statut || 'N/A'}
                      </span>
                      {p.statut === 'BLOQUE' && p.commentaireBloquant && (
                        <div style={{ fontSize: '10px', color: '#d9534f', marginTop: '2px' }}>
                          {p.commentaireBloquant.substring(0, 20)}...
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 12 }}>{CAT_LABEL[p.categorie] || p.categorie}</td>
                    <td style={{ fontSize: 12 }}>{userName(p.chefProjetId)}</td>
                    <td>{avancement}%</td>
                    
                    {/* --- COLONNE ACTIONS --- */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        
                        {/* Le Superviseur PEUT voir les tâches, c'est de la consultation */}
                         {(userRole!== 'PRESALES' ) && (
                          <>
                        <button
                          className="cis-btn cis-btn-ghost cis-btn-sm"
                          onClick={() => navigate(`/admin/projects/${p.id}/tasks`)}
                        >
                          <i className="ti ti-list-check"></i> Consulter
                        </button>
                          </>)}
                        {/* Le bouton Nouveau projet et les actions modifiantes n'apparaissent PAS pour le Superviseur */}
                        {(userRole === 'ADMIN' || userRole === 'CHEF_PROJET') && (
                          <>
                            <button className="cis-btn cis-btn-danger cis-btn-sm" onClick={() => handleDelete(p.id)}>
                              <i className="ti ti-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}