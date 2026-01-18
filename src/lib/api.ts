import axios from 'axios';
import { API_URL } from './config';

// Helper to handle API responses
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
    getTemplates: () => handleResponse(axios.get(`${API_URL}?action=get_templates`)),

    uploadTemplate: (formData: FormData) => handleResponse(axios.post(`${API_URL}?action=upload_template`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })),

    deleteTemplate: (id: number) => handleResponse(axios.post(`${API_URL}?action=delete_template`, { id })),

    // Projects
    getProjects: () => handleResponse(axios.get(`${API_URL}?action=get_projects`)),

    saveProject: (data: any) => handleResponse(axios.post(`${API_URL}?action=save_project`, data)),
};
