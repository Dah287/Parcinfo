import React, { useState } from 'react';
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
  FiAward
} from 'react-icons/fi';
import { FaFileExcel } from 'react-icons/fa';

const Sidebar = () => {
  const [openSections, setOpenSections] = useState({
    achats: true,
    materiels: true,
    attributions: false,
    fournisseurs: false,
    beneficiaires: false,
    rapports: false,
    parametres: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen w-61 fixed flex flex-col">
      {/* Header - Fixe */}
      <div className="p-4 border-b border-blue-700 bg-blue-900 z-10 shrink-0">
        <div className="flex items-center">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <FiPackage className="w-6 h-6 text-yellow-300" />
          </div>
          <h1 className="text-xl font-bold">GestionParcInfo</h1>
        </div>
      </div>
      
      {/* Contenu Scrollable - Flex-1 pour prendre l'espace disponible */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-6 custom-scrollbar">
        {/* Tableau de bord */}
        <div className="mb-2">
          <a href="/" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
            <FiHome className="mr-3 text-blue-300 group-hover:text-white" size={20} />
            <span className="font-medium">Tableau de bord</span>
          </a>
        </div>

        {/* Section Achats */}
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
              <li>
                <a href="/achats-excel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiList className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">Liste des achats</span>
                </a>
              </li>
              <li>
                <a href="/ConsultationPrixAchat" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiDollarSign className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">Consultation des prix</span>
                </a>
              </li>
              <li>
                <a href="/add-achats-excel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FaFileExcel className="mr-2 text-green-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Import Excel Prix</span>
                </a>
              </li>
              <li>
                <a href="/add-achats-manuel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiEdit3 className="mr-2 text-yellow-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Prix Manuel</span>
                </a>
              </li>
              {/* <li>
                <a href="/add-achat" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiFilePlus className="mr-2 text-green-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Nouvel achat</span>
                </a>
              </li> */}
              <li>
                <a href="/achats/statistiques" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiBarChart2 className="mr-2 text-purple-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Statistiques</span>
                </a>
              </li>
            </ul>
          )}
        </div>

        {/* Section Matériels */}
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
              <li>
                <a href="/materiels" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiGrid className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">Tous les matériels</span>
                </a>
              </li>
              <li>
                <a href="/preparation-affectation-materiel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiLayers className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">Préparation Affectation</span>
                </a>
              </li>
              <li>
                <a href="/AttributionMateriel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiUserCheck className="mr-2 text-green-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Attribution Matériel</span>
                </a>
              </li>
              <li>
                <a href="/ReaffectationMateriel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiRepeat className="mr-2 text-yellow-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Réaffectation Matériel</span>
                </a>
              </li>
              <li>
                <a href="/MultiReaffectation" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiCopy className="mr-2 text-purple-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Multi-Réaffectation</span>
                </a>
              </li>
              <li>
                <a href="/AffectationComplete" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiAward className="mr-2 text-purple-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Affectation Complète</span>
                </a>
              </li>
              <li>
                <a href="/HistoriqueMateriel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiClock className="mr-2 text-indigo-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Historique Matériel</span>
                </a>
              </li>
              <li>
                <a href="/liberation-materiel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiUserX className="mr-2 text-orange-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Libération Matériel</span>
                </a>
              </li>
            </ul>
          )}
        </div>

        {/* Section Attributions */}
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
                  <FiUserPlus className="mr-2 text-green-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Prises en charge</span>
                </a>
              </li>
              <li>
                <a href="/attributions/nouvelle" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiFilePlus className="mr-2 text-green-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Nouvelle attribution</span>
                </a>
              </li>
              <li>
                <a href="/attributions/historique" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiArchive className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">Historique</span>
                </a>
              </li>
              <li>
                <a href="/attributions/reaffecter" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiRefreshCw className="mr-2 text-yellow-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Réaffectation</span>
                </a>
              </li>
              <li>
                <a href="/attributions/liberer" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiFileMinus className="mr-2 text-orange-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Libération</span>
                </a>
              </li>
            </ul>
          )}
        </div>

        {/* Section Fournisseurs */}
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
              <li>
                <a href="/GestionFournisseurs" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiTruck className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">Liste des fournisseurs</span>
                </a>
              </li>

            </ul>
          )}
        </div>

        {/* Section Bénéficiaires */}
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
              <li>
                <a href="/gestion-beneficiaires" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiUsers className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">Liste des bénéficiaires</span>
                </a>
              </li>
              <li>
                <a href="/beneficiaires/ajouter" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiUserPlus className="mr-2 text-green-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Ajouter bénéficiaire</span>
                </a>
              </li>
              <li>
                <a href="/beneficiaires/attributions" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiBriefcase className="mr-2 text-purple-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Attributions par bénéficiaire</span>
                </a>
              </li>
            </ul>
          )}
        </div>

        {/* Section Rapports */}
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
              <li>
                <a href="/rapports/inventaire" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiGrid className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">Inventaire complet</span>
                </a>
              </li>
              <li>
                <a href="/rapports/etat-parc" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiPieChart className="mr-2 text-green-300 group-hover:text-white" size={16} />
                  <span className="ml-1">État du parc</span>
                </a>
              </li>
              <li>
                <a href="/rapports/financier" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiDollarSign className="mr-2 text-yellow-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Rapport financier</span>
                </a>
              </li>
              <li>
                <a href="/rapports/attributions" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiTrendingUp className="mr-2 text-purple-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Statistiques d'attributions</span>
                </a>
              </li>
            </ul>
          )}
        </div>

        {/* Section Paramètres */}
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
              <li>
                <a href="/parametres/types" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiBox className="mr-2 text-blue-200 group-hover:text-white" size={16} />
                  <span className="ml-1">Types de matériel</span>
                </a>
              </li>
              <li>
                <a href="/parametres/marques" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiTag className="mr-2 text-purple-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Marques</span>
                </a>
              </li>
              <li>
                <a href="/parametres/systemes" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiDatabase className="mr-2 text-green-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Systèmes d'exploitation</span>
                </a>
              </li>
              <li>
                <a href="/parametres/utilisateurs" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiUsers className="mr-2 text-green-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Comptes utilisateurs</span>
                </a>
              </li>
              <li>
                <a href="/parametres/roles" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiShield className="mr-2 text-yellow-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Rôles et permissions</span>
                </a>
              </li>
              <li>
                <a href="/parametres/configuration" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors group">
                  <FiSettings className="mr-2 text-yellow-300 group-hover:text-white" size={16} />
                  <span className="ml-1">Configuration système</span>
                </a>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Footer - Fixe en bas avec shrink-0 */}
      <div className="p-4 border-t border-blue-700 bg-blue-900/90 shrink-0">
        <div className="text-xs text-blue-200 text-center">
          <p className="flex items-center justify-center">
            <FiShield className="mr-1" size={12} />
            GestionParcInfo v1.9
          </p>
          <p className="mt-1">© 2026 Tous droits réservés</p>
        </div>
      </div>

      {/* Style pour la barre de défilement personnalisée */}
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