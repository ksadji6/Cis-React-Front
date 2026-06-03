import API from './api';

export const statistiqueService = {

    //afficher le dashboard statistiques
    getDashboardStats: async () => {
        const response = await API.get('/api/projects/statistiques/dashboard');
        return response.data; 
    }
};