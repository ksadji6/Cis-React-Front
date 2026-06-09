import API from './api';

export const documentService = {

    //upload (téléverser) un document 
upload: async (projectId, file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type); // Doit correspondre au nom dans ton @RequestParam

    const response = await API.post(`/api/projects/documents/upload/${projectId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
},

    //telecharger un document
    // Dans ton documentService.js
download: async (documentId, fileName) => {
    const response = await API.get(`/api/projects/documents/download/${documentId}`, { 
        responseType: 'arraybuffer' // Utilise 'arraybuffer' au lieu de 'blob' pour un contrôle total
    });

    // Création du fichier
    const blob = new Blob([response.data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}
    /*download: async (documentId, fileName) => {
    try {
        // On attend la réponse sous forme de 'blob' (données brutes)
        const response = await API.get(`/api/projects/documents/download/${documentId}`, { 
            responseType: 'blob' 
        });

        // Créer un lien virtuel pour le téléchargement
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // C'est ici que tu forces le nom et l'extension du fichier
        link.setAttribute('download', fileName || 'document_projet.pdf');
        
        // Ajout au DOM, clic forcé, et nettoyage
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error("Erreur téléchargement:", error);
        alert("Une erreur est survenue lors du téléchargement.");
    }
}*/,
    /*download: async (documentId) => {
        const response = await API.get(`/api/projects/documents/download/${documentId}`, { responseType: 'blob' });
        return response.data;
    },*/

    getByProjectId: async (projectId) => {
        const response = await API.get(`/api/projects/documents/project/${projectId}`);
        return response.data;
    },

    //supprimer un document
    delete: async (documentId) => {
        const response = await API.delete(`/api/projects/documents/delete/${documentId}`);
        return response.data;
    }
};