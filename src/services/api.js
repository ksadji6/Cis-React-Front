import axios from 'axios';

//on crée une instance axios branchée sur la gateway 
const API = axios.create({
    baseURL: 'http://localhost:8090', //adresse de la gateway
    headers : {
        'Content-Type': 'application/json'
    }
});

API.interceptors.request.use((config) => {
    // 1. On récupère le token
    const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
    
    // 2. On vérifie si on est en train d'appeler la route de login
    const isLoginRequest = config.url.includes('/api/auth/login');
    
    // 3. On n'ajoute le header Authorization QUE si on n'est PAS en train de faire un login
    if (token && !isLoginRequest) {
        const cleanToken = token.replace(/^"|"$/g, '');
        config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    
    console.log("Axios - Envoi vers :", config.url);
    console.log("Axios - Headers :", config.headers);
    
    return config;
}, (error) => Promise.reject(error));
export default API;
