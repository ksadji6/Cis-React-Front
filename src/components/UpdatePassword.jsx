import { useNavigate} from 'react-router-dom';
import { authService } from '../services/authService';
import { useState } from 'react';

function UpdatePassword(){
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const  [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit= async (e) => {
        e.preventDefault();
        setError('');

        //verificiation de la correspondance des mdp

        if(newPassword!== confirmPassword)
        {
            setError("Les mots de passe ne correspondent pas !");
            return;
        }
        //controle de longueur minimale
        if(newPassword.length < 6){
            setError("Le mot de passe doit contenir au moins 6 caractères. ");
            return;
        }

        try {
            //on recupere l'email du user connecté depuis le navigateur 
            const userString = localStorage.getItem('user');
            const userData = userString ? JSON.parse(userString) : null;
            const email = userData?.user?.email;

            //on appelle le backend et on lui passe le mail et le newPassword

            await authService.updatePassword({email: email, newPassword: newPassword });

            alert("Mot de passe mis à jour avec succès ! Veuillez vous reconnecter. ");

            //on vide le localStorage et on retourne à la page de login
            localStorage.clear();
            navigate ('/');
            
        } catch (err) {
            console.error("Erreur lors de la mise à jour du mot de passe: ", err);
            if(err.response && err.response.data){
                setError(err.response.data.message)
            }
            else{
                setError("Impossible de mettre à jour le mot de passe. Serveur indisponible.");
            }
            
            
        }
    };
    return (
    <div style={{ maxWidth: '400px', margin: '75px auto', padding: '40px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Première Connexion</h2>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>Par mesure de sécurité, vous devez modifier votre mot de passe par défaut avant d'accéder à la plateforme CIS.</p>
      
      <form onSubmit={handleSubmit}>
        {/* Message d'erreur s'il y en a une */}
        {error && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}

        {/* Champ Nouveau Mot de passe */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nouveau mot de passe :</label>
          <input 
            type="password" 
            placeholder="Minimum 6 caractères"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>

        {/* Champ Confirmation */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirmez le mot de passe :</label>
          <input 
            type="password" 
            placeholder="Retapez le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
          Valider le mot de passe
        </button>
      </form>
    </div>
    );

}
export default UpdatePassword;