import Login from './components/Login'; //on importe le composant de connexion
import ProtectedRoute from './components/ProtectedRoute' ;//on importe notre filtre pour les routes
import AdminDashboard from './components/AdminDashboard';
import UpdatePassword from './components/UpdatePassword';
import ChefProjetDashboard from './components/ChefProjetDashboard';
import PresalesDashboard from './components/PresalesDashboard';
import IngenieurDashboard from './components/IngenieurDashboard';
import SuperviseurDashboard from './components/SuperviseurDashboard';
import UserManagement from './components/UserManagement';
import ProjectManagement from './components/ProjectManagement';
import ProjectList from './components/ProjectList';
import TaskManager from './components/TaskManager';
import CreateProjectForm from './components/CreateProjectForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <Router>
      <Routes>
        {/* 1. La route par défaut : affiche l'écran de connexion */}
        <Route path="/" element={<Login />}/>
        
        {/* 2. La route pour le changement de mot de passe obligatoire */}
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* 3. Les routes des Dashboards selon les profils métiers CIS, ce sont les routes protégées */
        /* On enferme chaque route dans un protectedRoute pour filtrer les roles */}
        {/* DASHBOARD ADMIN */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
            }
        />
        {/* GESTION DES USERS */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        {/* GESTION DES PROJETS */}
        <Route 
          path="/admin/projects" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'CHEF_PROJET']}>
              <ProjectManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cprojet/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['CHEF_PROJET']}>
              <ChefProjetDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/projects/create" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'CHEF_PROJET']}>
              <CreateProjectForm />
            </ProtectedRoute>
          } 
/>
        <Route 
          path="/admin/projects/list" 
          element={<ProjectList />} />
        <Route 
          path="/admin/projects/:projectId/tasks" 
          element={<TaskManager />} 
        />
        <Route 
          path="/presales/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['PRESALES']}>
              <PresalesDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ingenieur/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['INGENIEUR']}>
              <IngenieurDashboard/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/superviseur/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['SUPERVISEUR']}>
              <SuperviseurDashboard/>
            </ProtectedRoute>
          } 
        />

        {/* 4. Route de secours si le chemin n'existe pas */}
        <Route path="*" element={<h2>Erreur 404 - Page introuvable</h2>} />
      </Routes>
    </Router>
  );
}

export default App;