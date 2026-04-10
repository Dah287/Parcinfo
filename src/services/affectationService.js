// services/combinedService.js (ou le nom de votre fichier)
import api from './api'; // ✅ Import de l'instance configurée

// ===============================
// 🔹 MATERIELS
// ===============================

export const affecterConfigurationComplete = (dto) =>
  api.post('/materiels/affectation-complete', dto);  // ✅ Utilise api au lieu de axios

export const getMaterielsDisponiblesParPrix = (achatId) =>
  api.get(`/materiels/achat/${achatId}/disponibles-par-prix`);  // ✅ Utilise api

// ===============================
// 🔹 ACHATS
// ===============================

export const getAllAchats = () =>
  api.get('/achats');  // ✅ Utilise api

// ===============================
// 🔹 BENEFICIAIRES
// ===============================

export const getAllBeneficiaires = () =>
  api.get('/beneficiaires');  // ✅ Utilise api