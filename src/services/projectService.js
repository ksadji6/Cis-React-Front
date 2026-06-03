import API from './api';

export const projectService = {

    // recuperer les statistiques du dashboard 
    getDashboardStats: async () => {
        const response = await API.get('/api/projects/statistiques/dashboard');
        return response.data;
    },

    // recuperer tous les projets reels de la bdd
    getAllProjects: async () => {
        const response = await API.get('/api/projects');
        return response.data;
    },

    // creer un projet
    create: async (projectData) => {
        const response = await API.post('/api/projects/create', projectData);
        return response.data;
    },

    // rechercher un projet a travers son id
    getById: async (projectId) => {
        const response = await API.get(`/api/projects/${projectId}`);
        return response.data;
    },

    // lancer un projet pour passer a la phase projet
    lancerProjet: async (id) => {
        const response = await API.put(`/api/projects/${id}/lancer`, {});
        return response.data;
    },

    // cloturer un projet pour passer a la phase post projet
    cloturer: async (projectId) => {
        const response = await API.put(`/api/projects/${projectId}/cloturer`);
        return response.data;
    },

    // exporter le document excel
    exportExcel: async () => {
        const response = await API.get('/api/projects/export/excel', { responseType: 'blob' });
        return response.data;
    },

    // creer une tache et l'assigner a un ingenieur
    createTask: async (projectId, taskData) => {
        const response = await API.post(`/api/projects/tasks/project/${projectId}`, taskData);
        return response.data;
    },

    // changer le statut d'une tache
    updateTaskStatus: async (taskId, status) => {
        const response = await API.put(`/api/projects/tasks/${taskId}/status?status=${status}`);
        return response.data;
    }
};