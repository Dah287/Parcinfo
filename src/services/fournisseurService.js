import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.80:8080/api/fournisseurs';

// 🔹 CRUD & listes
export const getAllFournisseurs = () => axios.get(API_BASE_URL);
export const getFournisseurById = (id) => axios.get(`${API_BASE_URL}/${id}`);
export const searchFournisseurs = (keyword) =>
  axios.get(`${API_BASE_URL}/search`, { params: { keyword } });

export const createFournisseur = (fournisseurData) =>
  axios.post(API_BASE_URL, fournisseurData);

export const updateFournisseur = (id, fournisseurData) =>
  axios.put(`${API_BASE_URL}/${id}`, fournisseurData);

export const deleteFournisseur = (id) =>
  axios.delete(`${API_BASE_URL}/${id}`);
