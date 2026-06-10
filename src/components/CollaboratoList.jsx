import { useEffect, useState } from 'react';
import { userService } from '../services/userService';

export default function CollaboratorList({ chefId, presalesId, ingenieurIds = [] }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // On récupère tous les utilisateurs en une seule fois
        const allUsers = await userService.getAll();
        const idsToFind = [chefId, presalesId, ...ingenieurIds].filter(Boolean);
        const filtered = allUsers.filter(u => idsToFind.includes(u.id));
        setUsers(filtered);
      } catch (e) {
        console.error("Erreur chargement collaborateurs", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [chefId, presalesId, JSON.stringify(ingenieurIds)]);

  if (loading) return <span>Chargement...</span>;

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {users.map(u => (
        <div key={u.id} className="cis-badge" style={{ 
            background: u.role === 'CHEF_PROJET' ? '#e8f7ee' : u.role === 'PRESALES' ? '#e8f0fe' : '#fef3e8',
            color: u.role === 'CHEF_PROJET' ? '#1a6b38' : u.role === 'PRESALES' ? '#1a5fb4' : '#954a10',
            display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px'
        }}>
          <i className="ti ti-user" style={{ fontSize: '12px' }}></i>
          {u.prenom} {u.nom} ({u.role})
        </div>
      ))}
    </div>
  );
}