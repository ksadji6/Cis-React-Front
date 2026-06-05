import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';

export default function CreateProjectForm() {
  const navigate = useNavigate();
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const styleInput = { width: '100%', padding: '8px', marginTop: '5px' };
  const styleButton = { width: '100%', padding: '10px', background: '#28A745', color: 'white', border: 'none', cursor: 'pointer' };
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isChefProjet = currentUser?.user?.role === 'CHEF_PROJET';   
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorie: 'SECURITE_RESEAUX',
    presalesId: '',
    chefProjetId: '',
    superviseurId: '',
    budget: '',
    dateFinEstimee: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAll();
        setCollaborateurs(Array.isArray(users) ? users : []);
      } catch (err) {
        setError("Erreur lors du chargement des collaborateurs. ",err);
      }
    };
    fetchUsers();
  }, []);

useEffect(() => {
  if (isChefProjet && currentUser?.user?.id) {
    setFormData(prev => ({ ...prev, chefProjetId: currentUser.user.id }));
  }
}, [isChefProjet, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // 1. Récupération sécurisée
    const user = JSON.parse(localStorage.getItem('user'));
    const loggedInId = user?.user?.id; 

    // 2. Calcul du chefIdFinal
    let chefIdFinal = isChefProjet ? loggedInId : formData.chefProjetId;
    
    // 3. Log pour vérifier ce qui se passe VRAIMENT
    console.log("DEBUG - isChefProjet:", isChefProjet);
    console.log("DEBUG - ID connecté:", loggedInId);
    console.log("DEBUG - chefIdFinal:", chefIdFinal);

    // 4. Force la conversion en nombre de manière sûre
    const finalChefIdParsed = parseInt(chefIdFinal, 10);

    if (isNaN(finalChefIdParsed)) {
      setError("Erreur : Impossible d'assigner le Chef de Projet. ID invalide.");
      setIsSubmitting(false);
      return;
    }    
    
    // Formatage pour correspondre au DTO Java (ProjectRequestDTO)
    const payload = {
      titre: formData.titre,
      description: formData.description,
      categorie: formData.categorie,
      presalesId: parseInt(formData.presalesId, 10),
      chefProjetId: finalChefIdParsed,
      superviseurId: parseInt(formData.superviseurId, 10),
      budget: parseFloat(formData.budget),
      dateFinEstimee: formData.dateFinEstimee ? `${formData.dateFinEstimee}T00:00:00` : null
    };
    // DEBUG : Vérifions avant l'appel API
    console.log("PAYLOAD FINAL :", payload);

    // Vérification de sécurité avant envoi
    if (isNaN(payload.chefProjetId) || !payload.chefProjetId) {
       setError("Erreur : Impossible de déterminer le Chef de Projet. Vérifiez votre connexion.");
       setIsSubmitting(false);
       return;
    }
    try {
      await projectService.create(payload);
      alert("Projet initialisé avec succès !");
      navigate('/admin/projects/list'); // Redirection vers la liste
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du projet.");
    } finally {
      setIsSubmitting(false);
      
    }
  };
  const handleBackToDashboard = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      const role = userData?.user?.role;

      if (role === 'CHEF_PROJET') {
        navigate('/cprojet/dashboard');
        return;
      }
    }
    navigate('/admin/dashboard');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <button 
        onClick={handleBackToDashboard}
        style={{ marginBottom: '20px', padding: '8px 15px', background: '#6C757D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        ⬅️ Retour au Tableau de Bord
      </button>
      <h2>Initialiser un nouveau projet</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Titre :</label>
          <input required style={styleInput} onChange={(e) => setFormData({...formData, titre: e.target.value})} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Description :</label>
          <textarea required style={styleInput} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Catégorie :</label>
          <select style={styleInput} onChange={(e) => setFormData({...formData, categorie: e.target.value})}>
            <option value="SECURITE_RESEAUX">Sécurité & Réseaux</option>
            <option value="INFRA_SYSTEME">Infrastructure Système</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Pré-sales :</label>
          <select required style={styleInput} onChange={(e) => setFormData({...formData, presalesId: e.target.value})}>
            <option value="">Choisir...</option>
            {collaborateurs.filter(u => u.role === 'PRESALES').map(u => 
                <option key={u.id} value={u.id}>{u.nom} {u.prenom}</option>
            )}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Chef de Projet :</label>
          {isChefProjet ? (
            // Affichage fixe si c'est le CP lui-même qui crée
            <div style={{ ...styleInput, background: '#f8f9fa', border: '1px solid #ccc' }}>
              {currentUser.user.prenom} {currentUser.user.nom}  (Automatique)
            </div>
              ) : (
            // Liste déroulante si c'est un Admin
            <select 
              required 
              style={styleInput} 
              onChange={(e) => setFormData({...formData, chefProjetId: e.target.value})}
            >
              <option value="">Choisir...</option>
              {collaborateurs.filter(u => u.role === 'CHEF_PROJET').map(u => 
                <option key={u.id} value={u.id}>{u.nom} {u.prenom}</option>
              )}
            </select>
      )}
    </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Superviseur :</label>
          <select required style={styleInput} onChange={(e) => setFormData({...formData, superviseurId: e.target.value})}>
            <option value="">Choisir...</option>
            {collaborateurs.filter(u => u.role === 'SUPERVISEUR').map(u => 
                <option key={u.id} value={u.id}>{u.nom} {u.prenom}</option>
            )}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Budget :</label>
          <input type="number" required style={styleInput} onChange={(e) => setFormData({...formData, budget: e.target.value})} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Date Clôture :</label>
          <input type="date" required style={styleInput} onChange={(e) => setFormData({...formData, dateFinEstimee: e.target.value})} />
        </div>

        <button type="submit" disabled={isSubmitting} style={styleButton}>
          {isSubmitting ? "Enregistrement..." : "Créer le projet"}
        </button>
      </form>
    </div>
  );
}

