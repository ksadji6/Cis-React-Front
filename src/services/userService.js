import API from './api';

export const userService = {

    //fonction pour afficher tous les users 
    getAll: async () => {
        const response = await API.get('/api/users/all');
        return response.data;
    },

    //creer un compte user 
    create: async (userData) => {
        const response = await API.post('/api/users/create', userData);
        return response.data;
    },

    //modifier les infos d'un compte 
    update: async (id, userData) => {
        const response = await API.put(`/api/users/${id}`, userData);
        return response.data;
    },

    getUserById: async (id) => {
    const response = await API.get(`/api/users/id/${id}`);
    return response.data;
},

    //changer le role d'un user
    changeRole: async (id, role) => {
    const response = await API.put(`/api/users/${id}/role?role=${role}`);
    return response.data;
    },

    //desactiver un compte
    disable: async (id) => {
        const response = await API.delete(`/api/users/disable/${id}`);
        return response.data;
    },

    //activer un compte 
    enable: async (id) => {
        const response = await API.put(`/api/users/enable/${id}`);
        return response.data;
    }

};