import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';

export const MesProjetsPage = () => {
  const [projets, setProjets] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'))?.user;

  useEffect(() => {
    const loadProjets = async () => {
      try {
        // Utilise la méthode qu'on a créée pour l'ingénieur
        const data = await projectService.getMesProjetsIngenieur(user.id);
        setProjets(data);
      } catch (err) {
        console.error("Erreur chargement projets:", err);
      }
    };
    loadProjets();
  }, [user.id]);

  return (
    <div className="cis-main">
      <div className="cis-page-header">
        <div>
          <h1 className="cis-page-title">Mes Projets</h1>
          <p className="cis-page-sub">Gestion et suivi de vos projets assignés</p>
        </div>
      </div>

      <div className="cis-card">
        <table className="cis-table">
          <thead>
            <tr>
              <th>Projet</th>
              <th>Phase</th>
              <th>Avancement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projets.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.titre}</td>
                <td><span className="cis-badge badge-blue">{p.phase}</span></td>
                <td style={{ width: '200px' }}>
                  <div className="cis-progress">
                    <div className="cis-progress-bar"><div className="cis-progress-fill fill-green" style={{ width: `${p.avancement}%` }}></div></div>
                    <span className="cis-progress-val">{p.avancement}%</span>
                  </div>
                </td>
                <td>
                  <button className="cis-btn cis-btn-ghost cis-btn-sm" onClick={() => navigate(`/ingenieur/projets/${p.id}`)}>
                    <i className="ti ti-eye"></i> Ouvrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};