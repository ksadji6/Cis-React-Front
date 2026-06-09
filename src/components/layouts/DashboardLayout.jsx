import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/cis.css'

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const user = userData?.user;
  const role = user?.role;

  const prenom = user?.prenom || '';
  const nom = user?.nom || '';
  const initials = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Couleur accent selon le rôle
  const accentClass = {
    ADMIN: 'active-yellow',
    CHEF_PROJET: 'active',
    INGENIEUR: 'active-orange',
    PRESALES: 'active-orange',
    SUPERVISEUR: 'active',
  }[role] || 'active';

  const avatarClass = {
    ADMIN: 'cis-avatar-yellow',
    CHEF_PROJET: 'cis-avatar-green',
    INGENIEUR: 'cis-avatar-orange',
    PRESALES: 'cis-avatar-orange',
    SUPERVISEUR: 'cis-avatar-green',
  }[role] || 'cis-avatar-gray';

  const roleLabel = {
    ADMIN: 'Administrateur',
    CHEF_PROJET: 'Chef de Projet',
    INGENIEUR: 'Ingénieur',
    PRESALES: 'Avant-Vente',
    SUPERVISEUR: 'Superviseur',
  }[role] || role;

  const logoSubColor = {
    ADMIN: '#fcd63c',
    CHEF_PROJET: '#20ab4b',
    INGENIEUR: '#ec8549',
    PRESALES: '#ec8549',
    SUPERVISEUR: '#20ab4b',
  }[role] || '#20ab4b';

  // Helper pour savoir si un lien est actif
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Menus selon le rôle
  const renderMenu = () => {
    if (role === 'ADMIN' || role === 'CHEF_PROJET') {
      return (
        <>
          <div className="cis-sidebar-section">Navigation</div>
          <div
            className={`cis-nav-item ${isActive('/cprojet/dashboard') || isActive('/admin/dashboard') ? accentClass : ''}`}
            onClick={() => navigate(role === 'ADMIN' ? '/admin/dashboard' : '/cprojet/dashboard')}
          >
            <i className="ti ti-layout-dashboard" aria-hidden="true"></i>
            Dashboard
          </div>
          <div
            className={`cis-nav-item ${isActive('/admin/projects/list') ? accentClass : ''}`}
            onClick={() => navigate('/admin/projects/list')}
          >
            <i className="ti ti-folder" aria-hidden="true"></i>
            Projets & Tâches
          </div>
          <div
            className={`cis-nav-item ${isActive('/admin/projects/create') ? accentClass : ''}`}
            onClick={() => navigate('/admin/projects/create')}
          >
            <i className="ti ti-plus" aria-hidden="true"></i>
            Créer un projet
          </div>
          {role === 'ADMIN' && (
            <div
              className={`cis-nav-item ${isActive('/admin/users') ? accentClass : ''}`}
              onClick={() => navigate('/admin/users')}
            >
              <i className="ti ti-users" aria-hidden="true"></i>
              Utilisateurs
            </div>
          )}
          <div className="cis-sidebar-section">Analyses</div>
          <div
            className={`cis-nav-item ${isActive('/dashboard') ? accentClass : ''}`}
            onClick={() => navigate('/dashboard')}>
            <i className="ti ti-chart-pie" aria-hidden="true"></i>
            Statistiques
          </div>
        </>
      );
    }

    if (role === 'INGENIEUR') {
      return (
        <>
          <div className="cis-sidebar-section">Navigation</div>
          <div
            className={`cis-nav-item ${isActive('/ingenieur/dashboard') ? accentClass : ''}`}
            onClick={() => navigate('/ingenieur/dashboard')}
          >
            <i className="ti ti-layout-dashboard" aria-hidden="true"></i>
            Mon espace
          </div>
          <div
            className={`cis-nav-item ${isActive('/ingenieur/taches') ? accentClass : ''}`}
            onClick={() => navigate('/ingenieur/taches')}
          >
            <i className="ti ti-list-check" aria-hidden="true"></i>
            Mes tâches
          </div>
          <div
            className={`cis-nav-item ${isActive('/ingenieur/projets') ? accentClass : ''}`}
            onClick={() => navigate('/ingenieur/projets')}
          >
            <i className="ti ti-list-check" aria-hidden="true"></i>
            Mes projets
          </div>
        </>
      );
    }

    if (role === 'PRESALES') {
      return (
        <>
          <div className="cis-sidebar-section">Navigation</div>
          <div
            className={`cis-nav-item ${isActive('/presales/dashboard') ? accentClass : ''}`}
            onClick={() => navigate('/presales/dashboard')}
          >
            <i className="ti ti-layout-dashboard" aria-hidden="true"></i>
            Dashboard
          </div>
          <div
            className={`cis-nav-item ${isActive('/presales/projects') ? accentClass : ''}`}
            onClick={() => navigate('/presales/projects')}
          >
            <i className="ti ti-upload" aria-hidden="true"></i>
            Mes projets
          </div>
        </>
      );
    }

    if (role === 'SUPERVISEUR') {
      return (
        <>
          <div className="cis-sidebar-section">Navigation</div>
          <div
            className={`cis-nav-item ${isActive('/superviseur/dashboard') ? accentClass : ''}`}
            onClick={() => navigate('/superviseur/dashboard')}
          >
            <i className="ti ti-layout-dashboard" aria-hidden="true"></i>
            Dashboard
          </div>
          <div
            className={`cis-nav-item ${isActive('/superviseur/rapports') ? accentClass : ''}`}
            onClick={() => navigate('/superviseur/rapports')}
          >
            <i className="ti ti-chart-bar" aria-hidden="true"></i>
            Rapports
          </div>
          <div className="cis-sidebar-section">Analyses</div>
          <div
            className={`cis-nav-item ${isActive('/dashboard') ? accentClass : ''}`}
            onClick={() => navigate('/dashboard')}>
            <i className="ti ti-chart-pie" aria-hidden="true"></i>
            Statistiques
          </div>
          <div
            className={`cis-nav-item ${isActive('/admin/projects/list') ? accentClass : ''}`}
            onClick={() => navigate('/admin/projects/list')}
          >
            <i className="ti ti-folder" aria-hidden="true"></i>
            Projets
          </div>

        </>
      );
    }
    

    return null;
  };

  return (
    <div className="cis-app">
      {/* SIDEBAR */}
      <aside className="cis-sidebar">
        {/* Logo */}
        <div className="cis-sidebar-logo">
          <div className="cis-sidebar-logo-name">CIS Integration</div>
          <div className="cis-sidebar-logo-role" style={{ color: logoSubColor }}>
            {roleLabel}
          </div>
        </div>

        {/* Menu */}
        <nav>{renderMenu()}</nav>

        {/* User + logout */}
        <div className="cis-sidebar-footer">
          <div className="cis-user-card">
            <div className={`cis-avatar ${avatarClass}`}>{initials}</div>
            <div>
              <div className="cis-user-name">{prenom} {nom}</div>
              <div className="cis-user-role">{roleLabel}</div>
            </div>
          </div>
          <button className="cis-btn-logout" onClick={handleLogout}>
            <i className="ti ti-logout" aria-hidden="true"></i>
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="cis-main">
        <Outlet />
      </main>
    </div>
  );
}