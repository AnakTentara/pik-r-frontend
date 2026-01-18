import axios from 'axios';

// Local API routes in Next.js
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

    saveProject: (data: any) => handleResponse(axios.post(`${API_BASE}/projects`, data)),
};
