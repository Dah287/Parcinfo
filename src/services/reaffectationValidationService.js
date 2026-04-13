// services/reaffectationValidationService.js
import api from './api';

const API_BASE_URL = '/reaffectation';

/**
 * Créer une demande de réaffectation
 */
export const creerDemandeReaffectation = async (dto, demandeurId, validateurId) => {
    const response = await api.post(`${API_BASE_URL}/demande`, {
        dto,
        demandeurId,
        validateurId
    });
    return response.data;
};

/**
 * Valider ou refuser une demande de réaffectation
 */
export const validerDemande = async (demandeId, validateurId, accepte, motifRejet = null) => {
    const response = await api.post(
        `${API_BASE_URL}/valider/${demandeId}?validateurId=${validateurId}&accepte=${accepte}&motifRejet=${motifRejet || ''}`
    );
    return response.data;
};

/**
 * Récupérer les demandes où l'utilisateur est validateur (en attente)
 */
export const getDemandesEnAttente = async (validateurId) => {
    const response = await api.get(`${API_BASE_URL}/demandes/en-attente/${validateurId}`);
    return response.data;
};

/**
 * Récupérer TOUTES les demandes d'un utilisateur (celles où il est demandeur OU validateur)
 */
export const getAllDemandes = async (userId) => {
    const response = await api.get(`${API_BASE_URL}/demandes/user/${userId}`);
    return response.data;
};

/**
 * Récupérer l'historique des demandes
 */
export const getHistoriqueDemandes = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`${API_BASE_URL}/demandes/historique${queryString ? `?${queryString}` : ''}`);
        return response.data;
    } catch (error) {
        console.warn('Endpoint historique non disponible, retour d\'un tableau vide');
        return [];
    }
};

// reaffectationValidationService.js - Modifier

/**
 * Créer une demande groupée de réaffectation
 */
export const creerDemandeReaffectationGroupee = async (materielIds, beneficiaireDestinationId, demandeurId, validateurId, dateTransfert, observations) => {
    const response = await api.post(`${API_BASE_URL}/demande/groupee`, {
        materielIds: materielIds,
        beneficiaireDestinationId: beneficiaireDestinationId,
        dateTransfert: dateTransfert,
        observations: observations,
        demandeurId: demandeurId,
        validateurId: validateurId
    });
    return response.data;
};

/**
 * Valider une demande groupée
 */
export const validerDemandeGroupee = async (demandeId, validateurId, accepte, motifRejet = null) => {
    const response = await api.post(
        `${API_BASE_URL}/valider/groupee/${demandeId}?validateurId=${validateurId}&accepte=${accepte}&motifRejet=${motifRejet || ''}`
    );
    return response.data;
};