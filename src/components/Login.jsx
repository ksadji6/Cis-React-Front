import { useState } from "react"; //hook qui permet de creer des etats
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";
function Login() {

    //pour la navigation des pages
    const navigate = useNavigate();
    
    //memoire pour le mail
    const [email, setEmail] = useState(''); 

    //memoire pour le password
    const [password, setPassword] =useState('');

    //fonction qui gère la connexion
    const handleSubmit = async (e) => {
        e.preventDefault(); //pour bloquer le rechargment de la page
        try {
        //on appelle le backend à travers la Gateway
        //on lui passe l'email et le password sous forme d'objet
            const data = await authService.login({email: email, password:password});
            console.log("Réponse du Backend :",data);
            //si la connexion reussit, on extrait le token JWt
            if (data.token)
            {
                //on stocke le token dans la memoire du navigateur
                localStorage.setItem('token', data.token);

                //on stocke les infos du user
                localStorage.setItem('user', JSON.stringify(data));
                
                alert("Connexion Réussie!! ");

                //redirection selon isFirstLogin = true or false?
                if(data.user && data.user.firstLogin === true)
                {
                    navigate("/update-password");
                }
                else {
                    //redirection selon les roles 
                    const userRole= data.user.role;
                    switch (userRole) {
                        case 'ADMIN':
                            navigate("/admin/dashboard")
                            break;
                        case 'CHEF_PROJET':
                            navigate("/cprojet/dashboard")
                            break;
                        case 'PRESALES':
                            navigate("/presales/dashboard")
                            break;
                        case 'INGENIEUR':
                            navigate("/ingenieur/dashboard")
                            break;
                        case 'SUPERVISEUR':
                            navigate("/superviseur/dashboard")
                            break;
                        default:
                            navigate("/dashboard");
                            break;
                    }
                }

            }
        
        }
        catch (error) {
            console.error("erreur de Connexion: ",error);
            if(error.response && error.response.data)
            {
                alert(`Erreur : ${error.response.data.message}`)
            }
            else {
                alert("Impossible de contacter le serveur de sécurité.");
            }
        }

    };
    //affichage du formulaire Login
  return (
    <div style={{ maxWidth: '400px', margin: '75px auto', padding: '60px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Connexion - CIS Integration</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Champ Email */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>Adresse Email :</label>
          <input 
            type="email" 
            placeholder="Ex: khadija@cis.sn" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} // e = evenemenet taper touche
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Champ Mot de passe */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>Mot de passe :</label>
          <input 
            type="password" 
            placeholder="******" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Bouton de soumission */}
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default Login;