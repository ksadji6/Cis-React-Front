import { useNavigate } from 'react-router-dom';

function AdminDashboard(){
    const navigate = useNavigate();

    //on recupere les infos de l'admin connecté pour personnaliser l'affichage avec ses infos
    const userString = localStorage.getItem('user');
    const userData = userString ? JSON.parse(userString) : null;

    //on extrait le prenom et le nom de l'admin connecté
    const prenom= userData?.user?.prenom || 'Admin';
    const nom = userData?.user?.nom || 'CIS';

    //fonction pour se deconnecter
    const handleLogout = () => {
        //on nettoie la memoire du navigateur et on efface le token
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        //après ca on renvoie vers la page de login 
        navigate('/');
    };

    return (
        <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      {/* Barre de navigation du haut (Header) */}
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2>Espace Administrateur - CIS Integration</h2>
        <div>
          <span style={{ marginRight: '15px', fontWeight: 'bold' }}>👋 Bienvenue, {prenom} {nom}</span>
          <button 
            onClick={handleLogout}
            style={{ padding: '8px 12px', background: '#d13100', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Menu latéral ou d'actions rapides */}
        <div style={{ width: '250px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>Actions Admin</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <button 
                onClick={() => navigate('/admin/users')} 
                style={{ width: '100%', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
              >
                👥 Gestion des Utilisateurs
              </button>
            </li>
            {/* 🎯 NOUVEAU BOUTON : Redirection vers le moteur de projet */}
            <li style={{ marginBottom: '10px' }}>
              <button 
                onClick={() => navigate('/admin/projects')} 
                style={{ width: '100%', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
              >
                📁 Gestion des Projets
              </button>
            </li>
            <li style={{ marginBottom: '10px' }}><button style={{ width: '100%', padding: '8px', textAlign: 'left', cursor: 'pointer' }}>📜 Logs de Sécurité</button></li>
            <li style={{ marginBottom: '10px' }}><button style={{ width: '100%', padding: '8px', textAlign: 'left', cursor: 'pointer' }}>⚙️ Configuration Système</button></li>
          </ul>
        </div>

        {/* Zone de travail de droite */}
        <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>TABLEAU DE BORD GENERAL</h3>
          <p>Sélectionnez une action dans le menu pour commencer à gérer la plateforme d'intégration.</p>
        </div>
      </div>
    </div>
    );
}

export default AdminDashboard;