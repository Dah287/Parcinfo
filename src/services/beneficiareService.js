// services/beneficiareService.js
import api from './api';

const API_BASE_URL = '/beneficiaires';

export const getAllBeneficiaires = () => {
  return api.get(API_BASE_URL);
};

export const getBeneficiaireById = (id) => {
  return api.get(`${API_BASE_URL}/${id}`);
};

export const createBeneficiaire = (data) => {
  return api.post(API_BASE_URL, data);
};

export const updateBeneficiaire = (id, data) => {
  return api.put(`${API_BASE_URL}/${id}`, data);
};

export const deleteBeneficiaire = (id) => {
  return api.delete(`${API_BASE_URL}/${id}`);
};

export const searchBeneficiaires = (keyword) => {
  return api.get(`${API_BASE_URL}/search`, { params: { keyword } });
};

export const getBeneficiairesByBureau = (bureauId) => {
  return api.get(`${API_BASE_URL}/bureau/${bureauId}`);
};

export const getBeneficiairesByDepartment = (departmentId) => {
  return api.get(`${API_BASE_URL}/department/${departmentId}`);
};

export const getBeneficiairesByService = (serviceId) => {
  return api.get(`${API_BASE_URL}/service/${serviceId}`);
};

export const checkMatriculeExists = (matricule) => {
  return api.get(`${API_BASE_URL}/exists/matricule/${matricule}`);
};

export const getBeneficiaireByMatricule = (matricule) => {
  return api.get(`${API_BASE_URL}/matricule/${matricule}`);
};

export const checkBeneficiaireExists = async (id) => {
  try {
    const response = await getBeneficiaireById(id);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};