import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.80:8080/api';

// ===============================
// 🔹 MATERIELS
// ===============================

export const affecterConfigurationComplete = (dto) =>
  axios.post(`${API_BASE_URL}/materiels/affectation-complete`, dto);

export const getMaterielsDisponiblesParPrix = (achatId) =>
  axios.get(`${API_BASE_URL}/materiels/achat/${achatId}/disponibles-par-prix`);


// ===============================
// 🔹 ACHATS
// ===============================

export const getAllAchats = () =>
  axios.get(`${API_BASE_URL}/achats`);

// ===============================
// 🔹 BENEFICIAIRES
// ===============================

export const getAllBeneficiaires = () =>
  axios.get(`${API_BASE_URL}/beneficiaires`);
