import { useNavigate } from 'react-router-dom';

function SuperviseurDashboard() {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const userData = JSON.parse(userString);
  const prenom = userData?.user?.prenom || 'Superviseur';
  const nom = userData?.user?.nom || 'CIS';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2>Espace Supervision & Audit - CIS</h2>
        <div>
          <span style={{ marginRight: '15px', fontWeight: 'bold' }}>👁️ {prenom} {nom}</span>
          <button onClick={handleLogout} style={{ padding: '8px 12px', background: '#DC3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Se déconnecter</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ width: '250px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>Vue d'Ensemble</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}><button style={{ width: '100%', padding: '8px', textAlign: 'left' }}>📈 Rapports de Performance</button></li>
            <li style={{ marginBottom: '10px' }}><button style={{ width: '100%', padding: '8px', textAlign: 'left' }}>🔍 Auditer un Projet</button></li>
          </ul>
        </div>
        <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Indicateurs Clés de Performance (KPI)</h3>
          <p>Vue managériale et audit sur l'ensemble des intégrations et propositions commerciales en cours au sein de Groupe CIS.</p>
        </div>
      </div>
    </div>
  );
}

export default SuperviseurDashboard;