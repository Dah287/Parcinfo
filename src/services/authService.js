// services/authService.js
import api from '../services/config/axiosConfig';

const API_BASE_URL = '/auth'; // Utilise le baseURL de api déjà configuré

// 🔹 Authentification - Login
export const login = (matricule, password, rememberMe) => {
  console.log('Tentative de login avec:', matricule);
  return api.post(`${API_BASE_URL}/login`, {
    matricule,
    password,
    rememberMe
  });
};

// 🔹 Inscription - Register
export const register = (userData) => {
  return api.post(`${API_BASE_URL}/register`, userData);
};

// 🔹 Déconnexion - Logout
export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
};

// 🔹 Vérifier si l'utilisateur est authentifié
export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};

// 🔹 Récupérer l'utilisateur courant
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 🔹 Récupérer le token JWT
export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// 🔹 Stocker les informations utilisateur après connexion
export const setUserSession = (userData, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  } else {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', userData.token);
  }
};

// 🔹 Mettre à jour le profil utilisateur
export const updateUserProfile = (userId, data) => {
  return api.put(`${API_BASE_URL}/users/${userId}`, data);
};

// 🔹 Changer le mot de passe
export const changePassword = (userId, oldPassword, newPassword) => {
  return api.put(`${API_BASE_URL}/users/${userId}/password`, {
    oldPassword,
    newPassword
  });
};

// 🔹 Récupérer tous les utilisateurs (Admin seulement)
export const getAllUsers = () => {
  return api.get(`${API_BASE_URL}/users`);
};

// 🔹 Récupérer un utilisateur par ID
export const getUserById = (id) => {
  return api.get(`${API_BASE_URL}/users/${id}`);
};

// 🔹 Supprimer un utilisateur (Admin seulement)
export const deleteUser = (id) => {
  return api.delete(`${API_BASE_URL}/users/${id}`);
};

// 🔹 Activer/Désactiver un utilisateur
export const toggleUserStatus = (id, actif) => {
  return api.put(`${API_BASE_URL}/users/${id}/status`, { actif });
};

// 🔹 Vérifier si un matricule existe déjà
export const checkMatriculeExists = (matricule) => {
  return api.get(`${API_BASE_URL}/exists/matricule/${matricule}`);
};

// 🔹 Vérifier si un email existe déjà
export const checkEmailExists = (email) => {
  return api.get(`${API_BASE_URL}/exists/email/${email}`);
};

// 🔹 Rafraîchir le token
export const refreshToken = () => {
  return api.post(`${API_BASE_URL}/refresh-token`);
};