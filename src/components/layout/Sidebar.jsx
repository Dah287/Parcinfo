// Sidebar.js - Version avec affichage personnalisé pour USER et ADMIN avec Demandes de transfert
import React, { useState, useEffect } from 'react';
import { 
  FiChevronDown, 
  FiChevronRight, 
  FiHome, 
  FiBox, 
  FiUsers, 
  FiShoppingCart,
  FiGrid,
  FiClock,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiTruck,
  FiList,
  FiDatabase,
  FiShield,
  FiSettings,
  FiEdit3,
  FiRepeat,
  FiCopy,
  FiAward,
  FiLogOut,
  FiFileText
} from 'react-icons/fi';
import { FaFileExcel } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';
import { getDemandesEnAttente } from '../../services/reaffectationValidationService';

const Sidebar = ({ onLogout, userRole = 'USER' }) => {
  const navigate = useNavigate();
  
  // État pour le nombre de demandes en attente
  const [demandesEnAttenteCount, setDemandesEnAttenteCount] = useState(0);
  const [openSections, setOpenSections] = useState({});

  // Charger le nombre de demandes en attente
  const loadDemandesEnAttente = async () => {
    try {
      const user = getCurrentUser();
      if (user && user.id) {
        const demandes = await getDemandesEnAttente(user.id);
        const count = Array.isArray(demandes) ? demandes.length : 0;
        setDemandesEnAttenteCount(count);
      }
    } catch (error) {
      console.error('Erreur chargement demandes en attente:', error);
    }
  };

  // Fonction pour récupérer l'état initial depuis localStorage
  const getInitialOpenSections = () => {
    if (typeof window === 'undefined') return null;
    
    const saved = localStorage.getItem('sidebarOpenSections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          achats: parsed.achats ?? false,
          materiels: parsed.materiels ?? true,
          attributions: parsed.attributions ?? false,
          fournisseurs: parsed.fournisseurs ?? false,
          beneficiaires: parsed.beneficiaires ?? false,
          rapports: parsed.rapports ?? false,
          parametres: parsed.parametres ?? false,
          administration: parsed.administration ?? false,
          demandes: parsed.demandes ?? false
        };
      } catch (e) {
        console.error('Erreur parsing sidebar state:', e);
      }
    }
    return {
      achats: false,
      materiels: true,
      attributions: false,
      fournisseurs: false,
      beneficiaires: false,
      rapports: false,
      parametres: false,
      administration: false,
      demandes: false
    };
  };

  // Initialiser openSections
  useEffect(() => {
    setOpenSections(getInitialOpenSections());
  }, []);

  // Écouter l'événement de mise à jour des demandes
  useEffect(() => {
    const handleDemandesUpdate = () => {
      loadDemandesEnAttente();
    };
    
    window.addEventListener('demandesUpdated', handleDemandesUpdate);
    return () => {
      window.removeEventListener('demandesUpdated', handleDemandesUpdate);
    };
  }, []);

  // Charger le nombre de demandes en attente au montage
  useEffect(() => {
    loadDemandesEnAttente();
    const interval = setInterval(loadDemandesEnAttente, 30000);
    return () => clearInterval(interval);
  }, []);

  // Synchroniser si localStorage change dans un autre onglet
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'sidebarOpenSections' && e.newValue) {
        try {
          setOpenSections(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Erreur sync localStorage:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(openSections).length > 0) {
      localStorage.setItem('sidebarOpenSections', JSON.stringify(openSections));
    }
  }, [openSections]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Configuration des sections pour ADMIN (complet) - AVEC Demandes de transfert
  const adminSectionsConfig = {
    demandes: {
      title: 'Demandes de transfert',
      icon: FiClock,
      items: [
        { path: '/demandes-reaffectation', label: 'Gestion des demandes', icon: FiList }
      ]
    },
    achats: {
      title: 'Achats',
      icon: FiShoppingCart,
      items: [
        { path: '/achats-excel', label: 'Liste des achats', icon: FiList },
        { path: '/ConsultationPrixAchat', label: 'Consultation des prix', icon: FiShoppingCart },
        { path: '/add-achats-excel', label: 'Import Excel Prix', icon: FaFileExcel },
        { path: '/add-achats-manuel', label: 'Prix Manuel', icon: FiEdit3 },
      ]
    },
    materiels: {
      title: 'Matériels',
      icon: FiBox,
      items: [
        { path: '/materiels', label: 'Tous les matériels', icon: FiGrid },
        { path: '/preparation-affectation-materiel', label: 'Préparation Affectation', icon: FiList },
        { path: '/AttributionMateriel', label: 'Attribution Matériel', icon: FiUserCheck },
        { path: '/ReaffectationMateriel', label: 'Réaffectation Matériel', icon: FiRepeat },
        { path: '/MultiReaffectation', label: 'Multi-Réaffectation', icon: FiCopy },
        { path: '/AffectationComplete', label: 'Affectation Complète', icon: FiAward },
        { path: '/HistoriqueMateriel', label: 'Historique Matériel', icon: FiClock },
        { path: '/liberation-materiel', label: 'Libération Matériel', icon: FiUserX },
        { path: '/pvs-transferts', label: 'PVs de transfert', icon: FiFileText  }
      ]
    },
    attributions: {
      title: 'Attributions',
      icon: FiUsers,
      items: [
        { path: '/prise-en-charge', label: 'Prises en charge', icon: FiUserPlus }
      ]
    },
    fournisseurs: {
      title: 'Fournisseurs',
      icon: FiTruck,
      items: [
        { path: '/GestionFournisseurs', label: 'Liste des fournisseurs', icon: FiTruck }
      ]
    },
    beneficiaires: {
      title: 'Bénéficiaires',
      icon: FiUsers,
      items: [
        { path: '/gestion-beneficiaires', label: 'Ajouter bénéficiaire', icon: FiUserPlus }
      ]
    },
    parametres: {
      title: 'Paramètres',
      icon: FiSettings,
      items: [
        { path: '/parametres/types', label: 'Types de matériel', icon: FiBox },
        { path: '/parametres/marques', label: 'Marques', icon: FiList },
        { path: '/parametres/systemes', label: "Systèmes d'exploitation", icon: FiDatabase }
      ]
    },
    administration: {
      title: 'Administration',
      icon: FiShield,
      items: [
        { path: '/admin/users', label: 'Gestion utilisateurs', icon: FiUsers }
      ]
    }
  };

  // Configuration des sections pour USER (limité)
  const userSectionsConfig = {
    demandes: {
      title: 'Demandes de transfert',
      icon: FiClock,
      items: [
        { path: '/demandes-reaffectation', label: 'Gestion des demandes', icon: FiList }
      ]
    },
    materiels: {
      title: 'Matériels',
      icon: FiBox,
      items: [
        { path: '/materiels', label: 'Tous les matériels', icon: FiGrid },
        { path: '/HistoriqueMateriel', label: 'Historique Matériel', icon: FiClock },
        { path: '/MultiReaffectation', label: 'Multi-Réaffectation', icon: FiCopy },
        { path: '/pvs-transferts', label: 'PVs de transfert', icon: FiFileText  }
      ]
    },
    attributions: {
      title: 'Attributions',
      icon: FiUsers,
      items: [
        { path: '/prise-en-charge', label: 'Prises en charge', icon: FiUserPlus }
      ]
    }
  };

  // Fonction pour obtenir le libellé du rôle
  const getRoleLabel = () => {
    const roleLabels = {
      'ADMIN': 'Administrateur',
      'GESTIONNAIRE': 'Gestionnaire',
      'TECHNICIEN': 'Technicien',
      'USER': 'Utilisateur'
    };
    return roleLabels[userRole] || 'Utilisateur';
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      navigate('/login');
    }
  };

  // Rendu pour ADMIN (tout afficher) - AVEC Demandes de transfert
  const renderAdminMenu = () => (
    <>
      {/* Demandes de transfert avec badge - PREMIÈRE SECTION */}
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
          onClick={() => toggleSection('demandes')}
        >
          <FiClock className="mr-3 text-blue-300 group-hover:text-white" size={20} />
          <span className="font-medium flex-1">Demandes de transfert</span>
          {demandesEnAttenteCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center animate-pulse">
              {demandesEnAttenteCount}
            </span>
          )}
          {openSections.demandes ? <FiChevronDown className="ml-2 text-blue-300" /> : <FiChevronRight className="ml-2 text-blue-300" />}
        </div>
        {openSections.demandes && (
          <ul className="ml-6 mt-1 space-y-1">
            {adminSectionsConfig.demandes.items.map((item, idx) => (
              <li key={idx}>
                <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">{item.label}</span>
                  {demandesEnAttenteCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {demandesEnAttenteCount}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Achats */}
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
          onClick={() => toggleSection('achats')}
        >
          <FiShoppingCart className="mr-3 text-blue-300 group-hover:text-white" size={20} />
          <span className="font-medium flex-1">Achats</span>
          {openSections.achats ? <FiChevronDown className="text-blue-300" /> : <FiChevronRight className="text-blue-300" />}
        </div>
        {openSections.achats && (
          <ul className="ml-6 mt-1 space-y-1">
            {adminSectionsConfig.achats.items.map((item, idx) => (
              <li key={idx}>
                <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Matériels */}
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
          onClick={() => toggleSection('materiels')}
        >
          <FiBox className="mr-3 text-blue-300 group-hover:text-white" size={20} />
          <span className="font-medium flex-1">Matériels</span>
          {openSections.materiels ? <FiChevronDown className="text-blue-300" /> : <FiChevronRight className="text-blue-300" />}
        </div>
        {openSections.materiels && (
          <ul className="ml-6 mt-1 space-y-1">
            {adminSectionsConfig.materiels.items.map((item, idx) => (
              <li key={idx}>
                <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Attributions */}
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
          onClick={() => toggleSection('attributions')}
        >
          <FiUsers className="mr-3 text-blue-300 group-hover:text-white" size={20} />
          <span className="font-medium flex-1">Attributions</span>
          {openSections.attributions ? <FiChevronDown className="text-blue-300" /> : <FiChevronRight className="text-blue-300" />}
        </div>
        {openSections.attributions && (
          <ul className="ml-6 mt-1 space-y-1">
            {adminSectionsConfig.attributions.items.map((item, idx) => (
              <li key={idx}>
                <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Fournisseurs */}
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
          onClick={() => toggleSection('fournisseurs')}
        >
          <FiTruck className="mr-3 text-blue-300 group-hover:text-white" size={20} />
          <span className="font-medium flex-1">Fournisseurs</span>
          {openSections.fournisseurs ? <FiChevronDown className="text-blue-300" /> : <FiChevronRight className="text-blue-300" />}
        </div>
        {openSections.fournisseurs && (
          <ul className="ml-6 mt-1 space-y-1">
            {adminSectionsConfig.fournisseurs.items.map((item, idx) => (
              <li key={idx}>
                <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bénéficiaires */}
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
          onClick={() => toggleSection('beneficiaires')}
        >
          <FiUsers className="mr-3 text-blue-300 group-hover:text-white" size={20} />
          <span className="font-medium flex-1">Bénéficiaires</span>
          {openSections.beneficiaires ? <FiChevronDown className="text-blue-300" /> : <FiChevronRight className="text-blue-300" />}
        </div>
        {openSections.beneficiaires && (
          <ul className="ml-6 mt-1 space-y-1">
            {adminSectionsConfig.beneficiaires.items.map((item, idx) => (
              <li key={idx}>
                <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Paramètres */}
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
          onClick={() => toggleSection('parametres')}
        >
          <FiSettings className="mr-3 text-blue-300 group-hover:text-white" size={20} />
          <span className="font-medium flex-1">Paramètres</span>
          {openSections.parametres ? <FiChevronDown className="text-blue-300" /> : <FiChevronRight className="text-blue-300" />}
        </div>
        {openSections.parametres && (
          <ul className="ml-6 mt-1 space-y-1">
            {adminSectionsConfig.parametres.items.map((item, idx) => (
              <li key={idx}>
                <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Administration */}
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
          onClick={() => toggleSection('administration')}
        >
          <FiShield className="mr-3 text-blue-300 group-hover:text-white" size={20} />
          <span className="font-medium flex-1">Administration</span>
          {openSections.administration ? <FiChevronDown className="text-blue-300" /> : <FiChevronRight className="text-blue-300" />}
        </div>
        {openSections.administration && (
          <ul className="ml-6 mt-1 space-y-1">
            {adminSectionsConfig.administration.items.map((item, idx) => (
              <li key={idx}>
                <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  // Rendu pour USER (menu limité)
  const renderUserMenu = () => (
    <>
      {/* Demandes de transfert avec badge */}
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
          onClick={() => toggleSection('demandes')}
        >
          <FiClock className="mr-3 text-blue-300 group-hover:text-white" size={20} />
          <span className="font-medium flex-1">Demandes de transfert</span>
          {demandesEnAttenteCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center animate-pulse">
              {demandesEnAttenteCount}
            </span>
          )}
          {openSections.demandes ? <FiChevronDown className="ml-2 text-blue-300" /> : <FiChevronRight className="ml-2 text-blue-300" />}
        </div>
        {openSections.demandes && (
          <ul className="ml-6 mt-1 space-y-1">
            {userSectionsConfig.demandes.items.map((item, idx) => (
              <li key={idx}>
                <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">{item.label}</span>
                  {demandesEnAttenteCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {demandesEnAttenteCount}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Matériels (limité) */}
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
          onClick={() => toggleSection('materiels')}
        >
          <FiBox className="mr-3 text-blue-300 group-hover:text-white" size={20} />
          <span className="font-medium flex-1">Matériels</span>
          {openSections.materiels ? <FiChevronDown className="text-blue-300" /> : <FiChevronRight className="text-blue-300" />}
        </div>
        {openSections.materiels && (
          <ul className="ml-6 mt-1 space-y-1">
            {userSectionsConfig.materiels.items.map((item, idx) => (
              <li key={idx}>
                <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Attributions (Prises en charge) */}
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
          onClick={() => toggleSection('attributions')}
        >
          <FiUsers className="mr-3 text-blue-300 group-hover:text-white" size={20} />
          <span className="font-medium flex-1">Attributions</span>
          {openSections.attributions ? <FiChevronDown className="text-blue-300" /> : <FiChevronRight className="text-blue-300" />}
        </div>
        {openSections.attributions && (
          <ul className="ml-6 mt-1 space-y-1">
            {userSectionsConfig.attributions.items.map((item, idx) => (
              <li key={idx}>
                <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen w-[16.5rem] fixed flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-blue-700 bg-gradient-to-r from-blue-900 to-indigo-900 z-10 shrink-0">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center">
              GestionParcInfo
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">v1.11</span>
            </h1>
            <p className="text-xs text-blue-200">
              Rôle: {getRoleLabel()}
            </p>
          </div>
        </div>
      </div>
      
      {/* Contenu Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-6 custom-scrollbar">
        {/* Tableau de bord - accessible à tous */}
        <div className="mb-2">
          <a href="/" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
            <FiHome className="mr-3 text-blue-300 group-hover:text-white" size={20} />
            <span className="font-medium">Tableau de bord</span>
          </a>
        </div>

        {/* Affichage conditionnel selon le rôle */}
        {userRole === 'ADMIN' ? renderAdminMenu() : renderUserMenu()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-blue-700 bg-blue-900/90 shrink-0">
        <div className="text-xs text-blue-200 text-center">
          <p>GestionParcInfo v1.11</p>
          <p className="mt-1">© 2026 Tous droits réservés</p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 3px; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  );
};

export default Sidebar;