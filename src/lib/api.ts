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
    duplicateProject: (id: string | number) => handleResponse(axios.post(`${API_BASE}/projects/duplicate`, { id })),
    getComments: (projectId: string | number) => handleResponse(axios.get(`${API_BASE}/projects/${projectId}/comments`)),
    addComment: (projectId: string | number, data: { author?: string; text: string }) => handleResponse(axios.post(`${API_BASE}/projects/${projectId}/comments`, data)),

    // Settings
    getSettings: () => handleResponse(axios.get(`${API_BASE}/settings`)),
    saveSettings: (data: Record<string, string>) => handleResponse(axios.post(`${API_BASE}/settings`, data)),

    // AI Generation
    generateCaption: (topic: string, tone: string) => handleResponse(axios.post(`${API_BASE}/generate`, { topic, tone })),
    removeBackground: (image: string) => handleResponse(axios.post(`${API_BASE}/remove-bg`, { image })),
};
