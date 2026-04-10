// services/achatService.js
import api from './api'; // ✅ Utilisez l'instance configurée

const API_BASE_URL = '/achats';
const API_BASE_URL_2 = '/prix/achats';
const PRIX_API_BASE_URL = '/prix';

export const getAllAchats = () => {
  return api.get(API_BASE_URL);
};

export const getAchatById = (id) => {
  return api.get(`${API_BASE_URL}/${id}`);
};

export const searchAchats = (keyword) => {
  return api.get(`${API_BASE_URL}/search`, { params: { keyword } });
};

export const createAchat = (achatData) => {
  return api.post(API_BASE_URL, achatData);
};

export const updateAchat = (id, achatData) => {
  return api.put(`${API_BASE_URL}/${id}`, achatData);
};

export const deleteAchat = (id) => {
  return api.delete(`${API_BASE_URL}/${id}`);
};

export const getPrixByAchat = (id) => {
  return api.get(`${API_BASE_URL}/${id}/prix`);
};

export const getStats = () => {
  return api.get(`${API_BASE_URL}/stats`);
};

export const importerPrixExcel = (achatId, formData) => {
  return api.post(`${API_BASE_URL}/${achatId}/import-prix`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const ajouterPrixManuellement = (achatId, prixList) => {
  return api.post(`${API_BASE_URL_2}/${achatId}/prix`, prixList);
};

export const getNombrePrixByAchat = (achatId) => {
  return api.get(`${PRIX_API_BASE_URL}/achat/${achatId}/count`);
};