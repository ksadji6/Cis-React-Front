import API from './api';

export const authService = {
    //fonction pour envoyer les identifiants à la gateway (mail et pswd)
    login: async (credentials) => {
        //credentials sera un objet reçu du formulaire : { email: '..', password: '..' }
        const response = await API.post('/api/auth/login', credentials);
        return response.data; //renvoie le JSON avec le token et les infos du user
    
    },

    //fonction pour update le mdp à la premiere connexion (isFirsLogin=true)
    updatePassword: async (passwordData) => {
        //passwordData= { email: '..', newPassword: '..' }
        const response = await API.post('/api/auth/update-password', passwordData);
        return response.data;
    }
}
