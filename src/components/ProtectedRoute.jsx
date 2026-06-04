import { Navigate } from 'react-router-dom';


//ce composant protège les routes 
function ProtectedRoute({ children, allowedRoles}) 
/* allowedRoles=liste des roles ayant accès, children= page à voir cachée derriere la protection  */
{
    //on recupere le token et les infos du user stockés dans le navigateur
    const token= localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    //s'il n ya pas de token --> le user n'est pas connecté
    if(!token || !userString){
        //on redirige direct vers la page de login
        return <Navigate to="/" replace />; /*redirection forcée immeidate et replace supprime l'historique */
    }

    //on transofrme le json en objet js
    const userData = JSON.parse(userString);
    const userRole = userData.user ? userData.user.role : null;

    //on verifie si le role est autorisée à acceder a la page 
    if (allowedRoles && !allowedRoles.includes(userRole)){
        //si le user n'a pas le bon role cad accès à cette page, on redirige vers la page d'accès refusé
        alert("Accès Refusé : Vous n'avez pas les permissions pour cette zone !");
        return <Navigate to="/" replace />;
    }


    const user = userData.user;

    // --- NOUVEAU : Blocage forcé si première connexion ---
    if (user?.firstLogin === true) {
        return <Navigate to="/update-password" replace />;
    }

    

    //s'il est connecté et a le bon rôle , on le laisse poursuivre et voir la page
    return children;
}
export default ProtectedRoute;