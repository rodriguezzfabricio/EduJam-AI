"use client";

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to add the token to requests
export const setupApiInterceptors = (getToken: () => string | null) => {
  api.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Study Group API
export const studyGroupApi = {
  getSubjects: async () => {
    const response = await api.get("/study-groups/subjects");
    return response.data;
  },
  
  getGroupsBySubject: async (subject: string) => {
    const response = await api.get(`/study-groups/by-subject/${subject}`);
    return response.data;
  },
  
  getGroup: async (groupId: string) => {
    const response = await api.get(`/study-groups/${groupId}`);
    return response.data;
  },
  
  createGroup: async (name: string, subject: string) => {
    const response = await api.post("/study-groups", { name, subject });
    return response.data;
  },
};

export default api; 