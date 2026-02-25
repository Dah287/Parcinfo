// services/beneficiareService.js
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

// 🔹 Bénéficiaires par bureau
export const getBeneficiairesByBureau = (bureauId) => {
  return axios.get(`${API_BASE_URL}/bureau/${bureauId}`);
};

// 🔹 Bénéficiaires par département
export const getBeneficiairesByDepartment = (departmentId) => {
  return axios.get(`${API_BASE_URL}/department/${departmentId}`);
};

// 🔹 Bénéficiaires par service
export const getBeneficiairesByService = (serviceId) => {
  return axios.get(`${API_BASE_URL}/service/${serviceId}`);
};

// 🔹 Vérifier si un matricule existe
export const checkMatriculeExists = (matricule) => {
  return axios.get(`${API_BASE_URL}/exists/matricule/${matricule}`);
};

// 🔹 Récupérer un bénéficiaire par matricule
export const getBeneficiaireByMatricule = (matricule) => {
  return axios.get(`${API_BASE_URL}/matricule/${matricule}`);
};

export const checkBeneficiaireExists = async (id) => {
  try {
    const response = await getBeneficiaireById(id);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};