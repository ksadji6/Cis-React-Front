import { Outlet, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user'));
  const user = userData?.user;
  const role = user?.role;

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ width: '260px', backgroundColor: '#1e293b', color: '#fff', padding: '20px' }}>
        <h3>{user?.prenom} {user?.nom}</h3>
        <p style={{ color: '#94a3b8' }}>{role}</p>

        {/* Menu selon le rôle */}
        {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
          <>
            <button onClick={() => navigate('/cprojet/dashboard')} style={navStyle}>📊 Dashboard</button>
            <button onClick={() => navigate('/admin/projects/create')} style={navStyle}>🆕 Initialiser Projet</button>
            <button onClick={() => navigate('/admin/projects/list')} style={navStyle}>📋 Projets & Tâches</button>
          </>
        )}
        {role === 'INGENIEUR' && (
          <button onClick={() => navigate('/ingenieur/taches')} style={navStyle}>📋 Mes Tâches</button>
        )}
        <button onClick={handleLogout} style={{ marginTop: 'auto', background: '#ef4444', color: 'white', border: 'none', padding: '10px' }}>Se déconnecter</button>
      </div>
      <div style={{ flex: 1, padding: '25px' }}><Outlet /></div>
    </div>
  );
}
const navStyle = { width: '100%', padding: '12px', background: 'transparent', border: 'none', color: '#cbd5e1', textAlign: 'left', cursor: 'pointer' };