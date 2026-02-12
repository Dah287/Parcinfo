import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.80:8080/api/beneficiaires';

// 🔹 Récupérer tous les bénéficiaires
export const getAllBeneficiaires = () => {
  return axios.get(API_BASE_URL);
};

// 🔹 Récupérer un bénéficiaire par ID
export const getBeneficiaireById = (id) => {
  return axios.get(`${API_BASE_URL}/${id}`);
};

// 🔹 Créer un bénéficiaire
export const createBeneficiaire = (data) => {
  return axios.post(API_BASE_URL, data);
};

// 🔹 Mettre à jour un bénéficiaire
export const updateBeneficiaire = (id, data) => {
  return axios.put(`${API_BASE_URL}/${id}`, data);
};

// 🔹 Supprimer un bénéficiaire
export const deleteBeneficiaire = (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`);
};

// 🔹 Rechercher des bénéficiaires
export const searchBeneficiaires = (keyword) => {
  return axios.get(`${API_BASE_URL}/search`, {
    params: { keyword }
  });
};

// 🔹 Bénéficiaires par département
export const getBeneficiairesByDepartement = (departement) => {
  return axios.get(`${API_BASE_URL}/departement/${departement}`);
};
