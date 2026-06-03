import {useNavigate} from 'react-router-dom';

function PresalesDashboard(){
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const userData = JSON.parse(userString);
    const prenom = userData?.user?.prenom || 'Avant';
    const nom = userData?.user?.nom || 'Vente';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };
    return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2>Espace Avant-Vente (Pre-Sales) - CIS Integration</h2>
        <div>
          <span style={{ marginRight: '15px', fontWeight: 'bold' }}>🤝 {prenom} {nom}</span>
          <button onClick={handleLogout} style={{ padding: '8px 12px', background: '#DC3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Se déconnecter</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ width: '250px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>Opportunités</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}><button style={{ width: '100%', padding: '8px', textAlign: 'left' }}>💡 Nouvel Appel d'Offres</button></li>
            <li style={{ marginBottom: '10px' }}><button style={{ width: '100%', padding: '8px', textAlign: 'left' }}>📝 Rédiger une Proposition Technique</button></li>
            <li style={{ marginBottom: '10px' }}><button style={{ width: '100%', padding: '8px', textAlign: 'left' }}>💵 Estimation des Coûts</button></li>
          </ul>
        </div>
        <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Dossiers d'architecture avant-vente</h3>
          <p>Analyse des besoins clients et dimensionnement des infrastructures d'intégration de CIS Sénégal.</p>
        </div>
      </div>
    </div>
  );
}
export default PresalesDashboard;