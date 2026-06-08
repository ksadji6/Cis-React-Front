import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/AdminDashboard';
import UpdatePassword from './components/UpdatePassword';
import ChefProjetDashboard from './components/ChefProjetDashboard';
import IngenieurDashboard from './components/IngenieurDashboard';
import IngenieurTasks from './components/IngenieurTask';
import UserManagement from './components/UserManagement';
import ProjectList from './components/ProjectList';
import TaskManager from './components/TaskManager';
import CreateProjectForm from './components/CreateProjectForm';
import DashboardLayout from './components/layouts/DashboardLayout';
import Dashboard from './components/Dashboard';
import SuperviseurDashboard from './components/SuperviseurDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        <Route element={<DashboardLayout />}>
          {/* Routes Admin / Chef de Projet */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
          <Route path="/cprojet/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'CHEF_PROJET']}><ChefProjetDashboard /></ProtectedRoute>} />
          <Route path="/admin/projects/create" element={<ProtectedRoute allowedRoles={['ADMIN', 'CHEF_PROJET']}><CreateProjectForm /></ProtectedRoute>} />
          <Route path="/admin/projects/list" element={<ProtectedRoute allowedRoles={['ADMIN', 'CHEF_PROJET']}><ProjectList /></ProtectedRoute>} />
          <Route path="/admin/projects/:projectId/tasks" element={<TaskManager />} />
          
          {/* Routes Ingénieur */}
          <Route path="/ingenieur/dashboard" element={<ProtectedRoute allowedRoles={['INGENIEUR']}><IngenieurDashboard /></ProtectedRoute>} />
          <Route path="/ingenieur/taches" element={<ProtectedRoute allowedRoles={['INGENIEUR']}><IngenieurTasks /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['CHEF_PROJET', 'ADMIN','SUPERVISEUR']}><Dashboard /></ProtectedRoute>} />

          {/* Routes SUPERVISEUR */}
          <Route path="/superviseur/dashboard" element={<ProtectedRoute allowedRoles={['SUPERVISEUR']}><SuperviseurDashboard /></ProtectedRoute>} />
          
        </Route>
        
        <Route path="*" element={<h2>Erreur 404 - Page introuvable</h2>} />
      </Routes>
    </Router>
  );
}
export default App;