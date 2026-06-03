import API from './api';

export const documentService = {

    //upload (téléverser) un document 
    upload: async (projectId, file, type) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await API.post(`/api/projects/documents/upload/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' } 
        });
        return response.data;
    },

    //telecharger un document
    download: async (documentId) => {
        const response = await API.get(`/api/projects/documents/download/${documentId}`, { responseType: 'blob' });
        return response.data;
    },

    //supprimer un document
    delete: async (documentId) => {
        const response = await API.delete(`/api/projects/documents/delete/${documentId}`);
        return response.data;
    }
};