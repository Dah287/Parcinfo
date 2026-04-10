// services/authService.js
import api from './api'; // ✅ Correction du chemin

const API_BASE_URL = '/auth';

export const login = (matricule, password, rememberMe) => {
  console.log('Tentative de login avec:', matricule);
  return api.post(`${API_BASE_URL}/login`, { matricule, password, rememberMe });
};

export const register = (userData) => {
  return api.post(`${API_BASE_URL}/register`, userData);
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const setUserSession = (userData, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  } else {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', userData.token);
  }
  console.log('✅ Session utilisateur enregistrée');
};

// 🔹 Récupérer tous les utilisateurs (Admin seulement)
export const getAllUsers = () => {
  return api.get(`${API_BASE_URL}/users`);
};

// 🔹 Récupérer un utilisateur par ID
export const getUserById = (id) => {
  return api.get(`${API_BASE_URL}/users/${id}`);
};

// 🔹 Créer un utilisateur
export const createUser = (userData) => {
  return api.post(`${API_BASE_URL}/users`, userData);
};

// 🔹 Mettre à jour un utilisateur
// 🔹 Mettre à jour un utilisateur (sans mot de passe obligatoire)
export const updateUser = (id, userData) => {
  // Ne pas envoyer les champs vides
  const dataToSend = { ...userData };
  
  // Si le mot de passe est vide, le supprimer de l'envoi
  if (!dataToSend.password || dataToSend.password.trim() === '') {
    delete dataToSend.password;
    delete dataToSend.confirmPassword;
  }
  
  return api.put(`${API_BASE_URL}/users/${id}`, dataToSend);
};

// 🔹 Supprimer un utilisateur (Admin seulement)
export const deleteUser = (id) => {
  return api.delete(`${API_BASE_URL}/users/${id}`);
};

// 🔹 Activer/Désactiver un utilisateur
export const toggleUserStatus = (id, actif) => {
  return api.put(`${API_BASE_URL}/users/${id}/status`, { actif });
};

// 🔹 Réinitialiser le mot de passe d'un utilisateur
export const resetUserPassword = (id, newPassword) => {
  return api.put(`${API_BASE_URL}/users/${id}/reset-password`, { password: newPassword });
};

// 🔹 Changer le rôle d'un utilisateur
export const updateUserRole = (id, role) => {
  return api.put(`${API_BASE_URL}/users/${id}/role`, { role });
};