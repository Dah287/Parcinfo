import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.80:8080/api/achats';
const API_BASE_URL_2 = 'http://192.168.1.80:8080/api/prix/achats';
const PRIX_API_BASE_URL = 'http://192.168.1.80:8080/api/prix'; // ✅ Nouvelle URL pour les prix
export const getAllAchats = () => {
  return axios.get(API_BASE_URL);
};

export const getAchatById = (id) => {
  return axios.get(`${API_BASE_URL}/${id}`);
};

export const searchAchats = (keyword) => {
  return axios.get(`${API_BASE_URL}/search`, { params: { keyword } });
};

export const createAchat = (achatData) => {
  return axios.post(API_BASE_URL, achatData);
};

export const updateAchat = (id, achatData) => {
  return axios.put(`${API_BASE_URL}/${id}`, achatData);
};

export const deleteAchat = (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`);
};

export const getPrixByAchat = (id) => {
  return axios.get(`${API_BASE_URL}/${id}/prix`);
};

export const getStats = () => {
  return axios.get(`${API_BASE_URL}/stats`);
};

// ✅ AJOUTEZ CES DEUX FONCTIONS
export const importerPrixExcel = (achatId, formData) => {
  return axios.post(`${API_BASE_URL}/${achatId}/import-prix`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const ajouterPrixManuellement = (achatId, prixList) => {
  return axios.post(`${API_BASE_URL_2}/${achatId}/prix`, prixList);
};

// ✅ NOUVELLE FONCTION : Nombre de prix par achat
export const getNombrePrixByAchat = (achatId) => {
  return axios.get(`${PRIX_API_BASE_URL}/achat/${achatId}/count`);
};