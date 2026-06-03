import axios from 'axios';

//on crée une instance axios branchée sur la gateway 
const API = axios.create({
    baseURL: 'http://localhost:8090', //adresse de la gateway
    headers : {
        'Content-Type': 'application/json'
    }
});

//intercepteur de securite
/*API.interceptors.request.use((config)=>{
    //on va chercher le token JWT
    const token = localStorage.getItem('token')
    
    //s'il existe, on l'injecte automatiquement dans le navigateur
    if(token)
    {
        config.headers.Authorization = `Bearer ${token}`;

    }
    return config;
}, (error) => {
    return Promise.reject(error)

});*/
// Temporairement, dans api.js, remplace l'intercepteur par celui-ci :
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
    
    // Nettoyage basique
    if (token) {
        const cleanToken = token.replace(/^"|"$/g, '');
        config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    
    // 💡 LOG CRITIQUE : On vérifie si la config est bien créée
    console.log("Axios - Envoi vers :", config.url);
    console.log("Axios - Headers :", config.headers);
    
    return config;
}, (error) => Promise.reject(error));
export default API;
