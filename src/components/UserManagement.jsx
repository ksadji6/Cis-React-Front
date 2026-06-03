import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';

function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Déjà à true par défaut
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  //etats pour le formulaire de création d'un utilisateur
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: 'CisTemporaire2026!', // Mot de passe temporaire par défaut
    role: 'INGENIEUR'
  });

  //1. Charger la liste des utilisateurs au chargement de la page
  const fetchUsers = async (isInitialMount = false) => {
    try {
      if (!isInitialMount) {
        setLoading(true);
      }
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Erreur récupération utilisateurs: ", err);
      setError("Impossible de charger la liste des collaborateurs. ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      await fetchUsers(true);
    };
    initFetch();
  }, []);

  // 2. Gérer la création d'un nouveau collaborateur/user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setError('');
      setIsSubmitting(true);

      const userPayload = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        password: "CisTemporaire2026!",
        role: formData.role,
        enabled: true,
        firstLogin: true
      };

      await userService.create(userPayload);
      
      alert("Compte créé avec succès !!");
      setFormData({ prenom: '', nom: '', email: '', password: 'CisTemporaire2026!', role: 'INGENIEUR' });

    } catch (err) {
      console.error("Erreur création: ", err);
      
      if (err.response && err.response.status === 404) {
        alert("Compte créé avec succès !!");
        setFormData({ prenom: '', nom: '', email: '', password: 'CisTemporaire2026!', role: 'INGENIEUR' });
      } else {
        setError("Erreur lors de la création du compte. Vérifiez si l'email existe déjà. "); 
      }
    } finally {
      await fetchUsers(false);
      setIsSubmitting(false);
    }
  };

  // 3. Gérer l'activation / désactivation d'un compte
  const toggleAccountStatus = async (user) => {
    try {
      if (user.enabled) {
        await userService.disable(user.id);
        alert(`Le compte de ${user.prenom} a été désactivé.`);
      } else {
        await userService.enable(user.id);
        alert(`Le compte de ${user.prenom} a été réactivé.`);
      }
      fetchUsers(false); 
    } catch (err) {
      console.error("Erreur statut compte:", err);
      alert("Impossible de modifier le statut du compte.");
    }
  };

  // 4. Gérer le changement de rôle
  const handleRoleChange = async (id, newRole) => {
    try {
      await userService.changeRole(id, newRole);
      alert("Rôle mis à jour avec succès !");
      fetchUsers(false);
    } catch (err) {
      console.error("Erreur changement rôle:", err);
      alert("Impossible de modifier le rôle.");
    }
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <button 
        onClick={() => navigate('/admin/dashboard')}
        style={{ marginBottom: '20px', padding: '8px 15px', background: '#6C757D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        ⬅️ Retour au Tableau de Bord
      </button>

      <h2>Administration du Personnel - CIS Integration</h2>
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        
        {/* FORMULAIRE DE CRÉATION*/}
        <div style={{ width: '350px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f8f9fa' }}>
          <h3>➕ Ajouter un Collaborateur</h3>
          <form onSubmit={handleCreateUser}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Prénom :</label>
              <input 
                type="text" 
                required 
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nom :</label>
              <input 
                type="text" 
                required 
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email Professionnel :</label>
              <input 
                type="email" 
                placeholder="ex: prenom.nom@cis.sn" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Rôle CIS :</label>
              <select 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="ADMIN">Administrateur</option>
                <option value="CHEF_PROJET">Chef de Projet</option>
                <option value="PRESALES">Avant-Vente (Pre-Sales)</option>
                <option value="INGENIEUR">Ingénieur Technique</option>
                <option value="SUPERVISEUR">Superviseur</option>
              </select>
            </div>
            <p style={{ fontSize: '12px', color: '#666' }}>💡 Mot de passe initial temporaire : <strong>CisTemporaire2026!</strong> (L'utilisateur devra le modifier à sa 1ère connexion).</p>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                width: '100%', 
                padding: '10px', 
                background: isSubmitting ? '#6C757D' : '#007BFF', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold' 
              }}
            >
              {isSubmitting ? "Création en cours..." : "Créer le compte"}
            </button>
          </form>
        </div>

        {/* TABLEAU DES UTILISATEURS*/}
        <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>👥 Liste des Collaborateurs Enregistrés</h3>
          {loading ? (
            <p>Chargement du personnel de CIS Integration...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#E9ECEF', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Nom & Prénom</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Rôle Actuel</th>
                  <th style={{ padding: '10px' }}>Statut</th>
                  <th style={{ padding: '10px' }}>Actions Sécurité</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{user.prenom} {user.nom}</td>
                    <td style={{ padding: '10px' }}>{user.email}</td>
                    <td style={{ padding: '10px' }}>
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        style={{ padding: '4px' }}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="CHEF_PROJET">CHEF_PROJET</option>
                        <option value="PRESALES">PRESALES</option>
                        <option value="INGENIEUR">INGENIEUR</option>
                        <option value="SUPERVISEUR">SUPERVISEUR</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', background: user.enabled ? '#D4EDDA' : '#F8D7DA', color: user.enabled ? '#155724' : '#721C24' }}>
                        {user.enabled ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button 
                        onClick={() => toggleAccountStatus(user)}
                        style={{ padding: '6px 12px', background: user.enabled ? '#f24a5b' : '#3fdf65', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        {user.enabled ? '🔒 Désactiver' : '🔓 Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

export default UserManagement;