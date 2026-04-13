// config/roleRoutes.js
export const roleRoutes = {
  ADMIN: {
    defaultPath: '/achats-excel',
    allowedRoutes: [
      '/', '/materiels', '/achats', '/achats-excel', '/add-achats-excel',
      '/add-achats-manuel', '/add-achat', '/ReaffectationMateriel',
      '/AttributionMateriel', '/MultiReaffectation', '/HistoriqueMateriel',
      '/GestionFournisseurs', '/AffectationComplete', '/ConsultationPrixAchat',
      '/attributions/PrisesEnChargeAchat', '/prise-en-charge', 
      '/preparation-affectation-materiel', '/gestion-beneficiaires',
      '/preparation-inventaire', '/admin/users', '/admin/settings', '/demandes-reaffectation', '/pvs-transferts'
    ]
  },
  GESTIONNAIRE: {
    defaultPath: '/materiels',
    allowedRoutes: [
      '/', '/materiels', '/achats', '/achats-excel', '/add-achats-excel',
      '/add-achats-manuel', '/add-achat', '/ReaffectationMateriel',
      '/AttributionMateriel', '/MultiReaffectation', '/HistoriqueMateriel',
      '/GestionFournisseurs', '/AffectationComplete', '/ConsultationPrixAchat',
      '/attributions/PrisesEnChargeAchat', '/prise-en-charge',
      '/preparation-affectation-materiel', '/gestion-beneficiaires'
    ]
  },
  TECHNICIEN: {
    defaultPath: '/materiels',
    allowedRoutes: [
      '/', '/materiels', '/HistoriqueMateriel', '/ConsultationPrixAchat',
      '/attributions/PrisesEnChargeAchat', '/prise-en-charge'
    ]
  },
  USER: {
    defaultPath: '/materiels',
    allowedRoutes: [
      '/', '/materiels', '/ConsultationPrixAchat', '/MultiReaffectation',
      '/attributions/PrisesEnChargeAchat','/preparation-inventaire','/HistoriqueMateriel', '/prise-en-charge', '/demandes-reaffectation', '/pvs-transferts'
    ]
  }
};

// Fonction pour obtenir la route par défaut selon le rôle
export const getDefaultRouteByRole = (role) => {
  const roleConfig = roleRoutes[role];
  return roleConfig ? roleConfig.defaultPath : '/materiels';
};

// Fonction pour vérifier si une route est autorisée pour un rôle
export const isRouteAllowed = (role, path) => {
  const roleConfig = roleRoutes[role];
  if (!roleConfig) return false;
  
  // Permettre toujours la route login
  if (path === '/login') return true;
  
  return roleConfig.allowedRoutes.some(route => 
    path === route || path.startsWith(route + '/')
  );
};