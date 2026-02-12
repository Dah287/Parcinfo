import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.80:8080/api/materiels';

// 🔹 CRUD & listes
export const getAllMateriels = () => axios.get(API_BASE_URL);
export const getMaterielsDisponibles = () => axios.get(`${API_BASE_URL}/disponibles`);
export const getMaterielsAttribues = () => axios.get(`${API_BASE_URL}/attribues`);
export const searchMateriels = (keyword) =>
  axios.get(`${API_BASE_URL}/search`, { params: { keyword } });

export const createMaterial = (materialData) =>
  axios.post(API_BASE_URL, materialData);

export const updateMaterial = (id, materialData) =>
  axios.put(`${API_BASE_URL}/${id}`, materialData);

export const deleteMaterial = (id) =>
  axios.delete(`${API_BASE_URL}/${id}`);

// 🔹 Relations
export const getMaterielsByBeneficiaire = (beneficiaireId) =>
  axios.get(`${API_BASE_URL}/beneficiaire/${beneficiaireId}`);

export const getMaterielsByAchat = (achatId) =>
  axios.get(`${API_BASE_URL}/achat/${achatId}`);

// ===============================
// 🔹 GESTION D’ATTRIBUTION
// ===============================

// Attribution d’un matériel
export const attribuerMateriel = (dto) =>
  axios.post(`${API_BASE_URL}/attribuer`, dto);

// Réaffectation d’un matériel
export const reaffecterMateriel = (dto) =>
  axios.post(`${API_BASE_URL}/reaffecter`, dto);

// Libération d’un matériel
export const libererMateriel = (id) =>
  axios.post(`${API_BASE_URL}/${id}/liberer`);
