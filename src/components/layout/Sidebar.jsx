import React, { useState, useEffect } from 'react';
import { 
  FiChevronDown, 
  FiChevronRight, 
  FiHome, 
  FiBox, 
  FiUsers, 
  FiFileText, 
  FiBarChart2, 
  FiSettings,
  FiShoppingCart,
  FiDollarSign,
  FiTag,
  FiClipboard,
  FiTrendingUp,
  FiPlus,
  FiUpload,
  FiDownload,
  FiGrid,
  FiRefreshCw,
  FiClock,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiTruck,
  FiPackage,
  FiArchive,
  FiCopy,
  FiLayers,
  FiCalendar,
  FiList,
  FiPieChart,
  FiDatabase,
  FiShield,
  FiKey,
  FiBriefcase,
  FiMapPin,
  FiPhone,
  FiMail,
  FiEdit3,
  FiFilePlus,
  FiFileMinus,
  FiRepeat,
  FiCornerUpRight,
  FiAward,
  FiLogOut
} from 'react-icons/fi';
import { FaFileExcel } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ onLogout, userRole = 'USER' }) => {
  const navigate = useNavigate();
  
  // ✅ Fonction pour récupérer l'état initial depuis localStorage
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
          administration: parsed.administration ?? false  // ✅ NOUVEAU
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
      administration: false  // ✅ NOUVEAU
    };
  };

  const [openSections, setOpenSections] = useState(getInitialOpenSections);

  // ✅ Synchroniser si localStorage change dans un autre onglet
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

  // ✅ Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarOpenSections', JSON.stringify(openSections));
    }
  }, [openSections]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ✅ Vérifier si l'utilisateur a accès à une section
  const hasAccess = (allowedRoles) => {
    if (userRole === 'ADMIN') return true;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(userRole);
    }
    return userRole === allowedRoles;
  };

  // ✅ Configuration des sections par rôle
  const sectionsConfig = {
    achats: {
      allowedRoles: ['ADMIN', 'GESTIONNAIRE'],
      showSection: false,
      items: [
        { path: '/achats-excel', label: 'Liste des achats', icon: FiList, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] },
        { path: '/ConsultationPrixAchat', label: 'Consultation des prix', icon: FiDollarSign, allowedRoles: ['ADMIN', 'GESTIONNAIRE', 'TECHNICIEN', 'USER'] },
        { path: '/add-achats-excel', label: 'Import Excel Prix', icon: FaFileExcel, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] },
        { path: '/add-achats-manuel', label: 'Prix Manuel', icon: FiEdit3, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] },
        // { path: '/achats/statistiques', label: 'Statistiques', icon: FiBarChart2, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] }
      ]
    },
    materiels: {
      allowedRoles: ['ADMIN', 'GESTIONNAIRE', 'TECHNICIEN', 'USER'],
      showSection: true,
      items: [
        { path: '/materiels', label: 'Tous les matériels', icon: FiGrid, allowedRoles: ['ADMIN', 'GESTIONNAIRE', 'TECHNICIEN', 'USER'] },
        { path: '/preparation-affectation-materiel', label: 'Préparation Affectation', icon: FiLayers, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] },
      //  { path: '/preparation-inventaire', label: 'Préparation Inventaire', icon: FiLayers, allowedRoles: ['ADMIN', 'GESTIONNAIRE', 'USER'] },
        { path: '/AttributionMateriel', label: 'Attribution Matériel', icon: FiUserCheck, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] },
        { path: '/ReaffectationMateriel', label: 'Réaffectation Matériel', icon: FiRepeat, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] },
        { path: '/MultiReaffectation', label: 'Multi-Réaffectation', icon: FiCopy, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] },
        { path: '/AffectationComplete', label: 'Affectation Complète', icon: FiAward, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] },
        { path: '/HistoriqueMateriel', label: 'Historique Matériel', icon: FiClock, allowedRoles: ['ADMIN', 'GESTIONNAIRE', 'TECHNICIEN', 'USER'] },
        { path: '/liberation-materiel', label: 'Libération Matériel', icon: FiUserX, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] }
      ]
    },
    attributions: {
      allowedRoles: ['ADMIN', 'GESTIONNAIRE', 'TECHNICIEN', 'USER'],
      showSection: true,
      items: [
        { path: '/prise-en-charge', label: 'Prises en charge', icon: FiUserPlus, allowedRoles: ['ADMIN', 'GESTIONNAIRE', 'TECHNICIEN', 'USER'] }
      ]
    },
    fournisseurs: {
      allowedRoles: ['ADMIN', 'GESTIONNAIRE'],
      showSection: false,
      items: [
        { path: '/GestionFournisseurs', label: 'Liste des fournisseurs', icon: FiTruck, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] }
      ]
    },
    beneficiaires: {
      allowedRoles: ['ADMIN', 'GESTIONNAIRE'],
      showSection: false,
      items: [
        { path: '/gestion-beneficiaires', label: 'Ajouter bénéficiaire', icon: FiUserPlus, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] }
      ]
    },
    rapports: {
      allowedRoles: ['ADMIN', 'GESTIONNAIRE'],
      showSection: false,
      items: [
        { path: '/rapports/inventaire', label: 'Inventaire complet', icon: FiGrid, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] },
        { path: '/rapports/etat-parc', label: 'État du parc', icon: FiPieChart, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] },
        { path: '/rapports/financier', label: 'Rapport financier', icon: FiDollarSign, allowedRoles: ['ADMIN', 'GESTIONNAIRE'] }
      ]
    },
    parametres: {
      allowedRoles: ['ADMIN'],
      showSection: false,
      items: [
        { path: '/parametres/types', label: 'Types de matériel', icon: FiBox, allowedRoles: ['ADMIN'] },
        { path: '/parametres/marques', label: 'Marques', icon: FiTag, allowedRoles: ['ADMIN'] },
        { path: '/parametres/systemes', label: "Systèmes d'exploitation", icon: FiDatabase, allowedRoles: ['ADMIN'] }
      ]
    }
  };

  // ✅ Configuration de la section Administration (séparée pour plus de clarté)
  const adminItems = [
    { path: '/admin/users', label: 'Gestion utilisateurs', icon: FiUsers, allowedRoles: ['ADMIN'] },
    { path: '/parametres/roles', label: 'Rôles et permissions', icon: FiShield, allowedRoles: ['ADMIN'] },
    { path: '/parametres/configuration', label: 'Configuration système', icon: FiSettings, allowedRoles: ['ADMIN'] }
  ];

  // ✅ Fonction pour obtenir le libellé du rôle
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

  return (
    <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen w-[16.5rem] fixed flex flex-col">
      {/* Header - Fixe */}
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

        {/* Section Achats */}
        {userRole !== 'USER' && hasAccess(sectionsConfig.achats.allowedRoles) && (
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
                {sectionsConfig.achats.items.map((item, index) => (
                  hasAccess(item.allowedRoles) && (
                    <li key={index}>
                      <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                        <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                        <span className="ml-1">{item.label}</span>
                      </a>
                    </li>
                  )
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Section Matériels */}
        {hasAccess(sectionsConfig.materiels.allowedRoles) && (
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
                {userRole === 'USER' ? (
                  <>
                    <li>
                      <a href="/materiels" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                        <FiGrid className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                        <span className="ml-1">Tous les matériels</span>
                      </a>
                    </li>
                    <li>
                      <a href="/HistoriqueMateriel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                        <FiClock className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                        <span className="ml-1">Historique Matériel</span>
                      </a>
                    </li>
                    <li>
                      <a href="/preparation-inventaire" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                        <FiLayers className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                        <span className="ml-1">Préparation Inventaire</span>
                      </a>
                    </li>
                  </>
                ) : (
                  sectionsConfig.materiels.items.map((item, index) => (
                    hasAccess(item.allowedRoles) && (
                      <li key={index}>
                        <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                          <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                          <span className="ml-1">{item.label}</span>
                        </a>
                      </li>
                    )
                  ))
                )}
              </ul>
            )}
          </div>
        )}

        {/* Section Attributions */}
        {hasAccess(sectionsConfig.attributions.allowedRoles) && (
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
                <li>
                  <a href="/prise-en-charge" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                    <FiUserPlus className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                    <span className="ml-1">Prises en charge</span>
                  </a>
                </li>
              </ul>
            )}
          </div>
        )}



        {/* Section Fournisseurs */}
        {userRole !== 'USER' && hasAccess(sectionsConfig.fournisseurs.allowedRoles) && (
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
                {sectionsConfig.fournisseurs.items.map((item, index) => (
                  hasAccess(item.allowedRoles) && (
                    <li key={index}>
                      <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                        <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                        <span className="ml-1">{item.label}</span>
                      </a>
                    </li>
                  )
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Section Bénéficiaires */}
        {userRole !== 'USER' && hasAccess(sectionsConfig.beneficiaires.allowedRoles) && (
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
                {sectionsConfig.beneficiaires.items.map((item, index) => (
                  hasAccess(item.allowedRoles) && (
                    <li key={index}>
                      <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                        <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                        <span className="ml-1">{item.label}</span>
                      </a>
                    </li>
                  )
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Section Rapports */}
        {/* {userRole !== 'USER' && hasAccess(sectionsConfig.rapports.allowedRoles) && (
          <div className="mb-2">
            <div 
              className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors group"
              onClick={() => toggleSection('rapports')}
            >
              <FiFileText className="mr-3 text-blue-300 group-hover:text-white" size={20} />
              <span className="font-medium flex-1">Rapports</span>
              {openSections.rapports ? <FiChevronDown className="text-blue-300" /> : <FiChevronRight className="text-blue-300" />}
            </div>
            {openSections.rapports && (
              <ul className="ml-6 mt-1 space-y-1">
                {sectionsConfig.rapports.items.map((item, index) => (
                  hasAccess(item.allowedRoles) && (
                    <li key={index}>
                      <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                        <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                        <span className="ml-1">{item.label}</span>
                      </a>
                    </li>
                  )
                ))}
              </ul>
            )}
          </div>
        )} */}

        {/* ✅ Section Administration - UNIQUEMENT pour ADMIN avec Gestion utilisateurs */}
        {userRole === 'ADMIN' && (
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
                <li>
                  <a href="/admin/users" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                    <FiUsers className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                    <span className="ml-1">Gestion utilisateurs</span>
                  </a>
                </li>
                {/* <li>
                  <a href="/parametres/roles" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                    <FiShield className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                    <span className="ml-1">Rôles et permissions</span>
                  </a>
                </li>
                <li>
                  <a href="/parametres/configuration" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                    <FiSettings className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                    <span className="ml-1">Configuration système</span>
                  </a>
                </li> */}
              </ul>
            )}
          </div>
        )}

        {/* Section Paramètres (configuration technique) */}
        {userRole !== 'USER' && hasAccess(sectionsConfig.parametres.allowedRoles) && (
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
                {sectionsConfig.parametres.items.map((item, index) => (
                  hasAccess(item.allowedRoles) && (
                    <li key={index}>
                      <a href={item.path} className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                        <item.icon className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                        <span className="ml-1">{item.label}</span>
                      </a>
                    </li>
                  )
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Footer - Fixe en bas avec bouton déconnexion */}
      <div className="p-4 border-t border-blue-700 bg-blue-900/90 shrink-0">
        {/* <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 mb-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
        >
          <FiLogOut size={18} />
          <span>Déconnexion</span>
        </button> */}
        <div className="text-xs text-blue-200 text-center">
          <p className="flex items-center justify-center">
            <FiShield className="mr-1" size={12} />
            GestionParcInfo v1.11
          </p>
          <p className="mt-1">© 2026 Tous droits réservés</p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;