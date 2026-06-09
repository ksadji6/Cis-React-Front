import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DocumentSection from "./DocumentSection";
import { projectService } from "../services/projectService";
import { documentService } from "../services/documentService";
import { userService } from '../services/userService';

export const DetailProjetIngenieur = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [collaborateurs, setCollaborateurs] = useState({}); // On stocke les noms ici

    // 1. On déclare fetchNomUtilisateur en premier, ou avec useCallback
    const fetchNomUtilisateur = useCallback(async (userId, key) => {
        try {
            const user = await userService.getUserById(userId);
            setCollaborateurs(prev => ({ ...prev, [key]: `${user.prenom} ${user.nom}` }));
        } catch (err) {
            setCollaborateurs(prev => ({ ...prev, [key]: `Utilisateur ${userId}` }));
        }
    }, []); // Pas de dépendances ici

    // 2. Maintenant on peut l'appeler dans fetchProject sans erreur
    const fetchProject = useCallback(async () => {
        try {
            const data = await projectService.rechercherProjectById(id);
            const docs = await documentService.getByProjectId(id);
            setProject({ ...data, documents: docs });

            if (data.chefProjetId) fetchNomUtilisateur(data.chefProjetId, 'chef');
            if (data.presalesId) fetchNomUtilisateur(data.presalesId, 'presales');
        } catch (error) {
            console.error("Erreur chargement projet", error);
        }
    }, [id, fetchNomUtilisateur]); // On ajoute fetchNomUtilisateur ici

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    if (!project) return <div>Chargement...</div>;

    return (
        <div style={{ padding: '25px' }}>
            <h1>{project.titre}</h1>
            <div className="cis-card">
                <div className="cis-card-title">Collaborateurs</div>
                <p>Chef de projet : <strong>{collaborateurs.chef || "Chargement..."}</strong></p>
                <p>Presales : <strong>{collaborateurs.presales || "Chargement..."}</strong></p>
            </div>
            
                <DocumentSection 
                    projectId={id} 
                    documents={project.documents || []} 
                    userRole="INGENIEUR" 
                    onUploadSuccess={fetchProject} 
                />
            </div>
        
    );
};