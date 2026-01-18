import axios from 'axios';

const API_BASE = '/api';

const handleResponse = async (request: Promise<any>) => {
    try {
        const response = await request;
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const api = {
    // Templates
    getTemplates: () => handleResponse(axios.get(`${API_BASE}/templates`)),
    uploadTemplate: (formData: FormData) => handleResponse(axios.post(`${API_BASE}/templates`, formData)),
    deleteTemplate: (id: number) => handleResponse(axios.delete(`${API_BASE}/templates`, { data: { id } })),

    // Projects
    getProjects: () => handleResponse(axios.get(`${API_BASE}/projects`)),
    createProject: (data: { name: string; type: string }) => handleResponse(axios.post(`${API_BASE}/projects`, data)),
    getProject: (id: string | number) => handleResponse(axios.get(`${API_BASE}/projects/${id}`)),
    updateProject: (id: string | number, data: any) => handleResponse(axios.put(`${API_BASE}/projects/${id}`, data)),
    deleteProject: (id: string | number) => handleResponse(axios.delete(`${API_BASE}/projects/${id}`)),
};
