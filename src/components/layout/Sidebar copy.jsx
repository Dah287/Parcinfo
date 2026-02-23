import React, { useState } from 'react';
import { 
  FiChevronDown, 
  FiChevronRight, 
  FiHome, 
  FiBox, 
  FiUsers, 
  FiFileText, 
  FiBarChart, 
  FiSettings,
  FiShoppingCart,
  FiDollarSign,
  FiTag,
  FiClipboard,
  FiTrendingUp,
  FiPlus,
  FiUpload,
  FiFile,
  FiGrid,
  FiRefreshCw,
  FiDownload,
  FiEdit,
  FiPlusCircle,
  FiClock  
} from 'react-icons/fi';
import { FaFileExcel } from 'react-icons/fa'; // Import Excel
const Sidebar = () => {
  const [openSections, setOpenSections] = useState({
    materiels: true,
    achats: true,
    prixExcel: false,
    attributions: false,
    utilisateurs: false,
    rapports: false,
    parametres: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen w-64 fixed">
      <div className="p-4 border-b border-blue-700">
        <div className="flex items-center">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-yellow-300">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M12 6v6h6v-6h-6zm0 10c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold">GestionParcInfo</h1>
        </div>
      </div>
      
      <div className="p-4 pt-6">
        {/* Tableau de bord */}
        <div className="mb-2">
          <a href="/" className="flex items-center hover:bg-blue-700 p-2 rounded-lg transition-colors">
            <FiHome className="mr-3 text-blue-300" size={20} />
            <span className="font-medium">Tableau de bord</span>
          </a>
        </div>


        {/* Section Achats */}
        <div className="mb-2">
          <div 
            className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors"
            onClick={() => toggleSection('achats')}
          >
            <FiShoppingCart className="mr-3 text-blue-300" size={20} />
            <span className="font-medium">Achats</span>
            {openSections.achats ? <FiChevronDown className="ml-auto" /> : <FiChevronRight className="ml-auto" />}
          </div>
          {openSections.achats && (
            <ul className="ml-6 mt-1 space-y-1">
              <li>
                <a href="/achats-excel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiClipboard className="mr-2 text-blue-200" size={16} />
                  <span className="ml-1">Liste des achats</span>
                </a>
              </li>
                            <li>
                <a href="/ConsultationPrixAchat" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiClipboard className="mr-2 text-blue-200" size={16} />
                  <span className="ml-1">Consultation des prix</span>
                </a>
              </li>
              <li>
                <a href="/add-achats-excel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiUpload className="mr-2 text-yellow-300" size={16} />
                  <span className="ml-1">Import Excel  Prix</span>
                </a>
              </li>
                            <li>
                <a href="/add-achats-manuel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiPlusCircle   className="mr-2 text-yellow-300" size={16} />
                  <span className="ml-1">Prix Manuel </span>
                </a>
              </li>
              <li>
                <a href="/add-achat" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiPlus className="mr-2 text-green-300" size={16} />
                  <span className="ml-1">Nouvel achat </span>
                </a>
              </li>
              <li>
                <a href="/achats/statistiques" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiBarChart className="mr-2 text-purple-300" size={16} />
                  <span className="ml-1">Statistiques</span>
                </a>
              </li>
            </ul>
          )}
        </div>


        {/* Section Matériels */}
        <div className="mb-2">
          <div 
            className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors"
            onClick={() => toggleSection('materiels')}
          >
            <FiBox className="mr-3 text-blue-300" size={20} />
            <span className="font-medium">Matériels</span>
            {openSections.materiels ? <FiChevronDown className="ml-auto" /> : <FiChevronRight className="ml-auto" />}
          </div>
          {openSections.materiels && (
            <ul className="ml-6 mt-1 space-y-1">
              <li>
                <a href="/materiels" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiGrid className="mr-2 text-blue-200" size={16} />
                  <span className="ml-1">Tous les matériels </span>
                </a>
              </li>
                            <li>
                <a href="/preparation-affectation-materiel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiGrid className="mr-2 text-blue-200" size={16} />
                  <span className="ml-1">Préparation Affectation</span>
                </a>
              </li>
              <li>
                <a href="/AttributionMateriel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiBox className="mr-2 text-green-300" size={16} />
                  <span className="ml-1">Attribution Materiel</span>
                </a>
              </li>
              <li>
                <a href="/ReaffectationMateriel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiUsers className="mr-2 text-yellow-300" size={16} />
                  <span className="ml-1">Reaffectation Materiel</span>
                </a>
              </li>
              <li>
                <a href="/MultiReaffectation" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiPlus className="mr-2 text-purple-300" size={16} />
                  <span className="ml-1">Multi-Reaffectation</span>
                </a>
              </li>

                            <li>
                <a href="/AffectationComplete" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiPlus className="mr-2 text-purple-300" size={16} />
                  <span className="ml-1">Affectation Complete</span>
                </a>
              </li>

                            <li>
                <a href="/HistoriqueMateriel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiClock  className="mr-2 text-indigo-300" size={16} />
                  <span className="ml-1">Historique Materiel</span>
                </a>
              </li>
            </ul>
          )}
        </div>


        {/* Section Prix Excel */}
        <div className="mb-2">
          <div 
            className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors"
            onClick={() => toggleSection('prixExcel')}
          >
            <FiUpload className="mr-3 text-blue-300" size={20} />
            <span className="font-medium">Import Excel</span>
            {openSections.prixExcel ? <FiChevronDown className="ml-auto" /> : <FiChevronRight className="ml-auto" />}
          </div>
          {openSections.prixExcel && (
            <ul className="ml-6 mt-1 space-y-1">
              <li>
                <a href="/achats-excel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiFile className="mr-2 text-green-300" size={16} />
                  <span className="ml-1">Gestion des prix</span>
                </a>
              </li>
              <li>
                <a href="/add-achats-excel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiUpload className="mr-2 text-blue-200" size={16} />
                  <span className="ml-1">Importer via Excel</span>
                </a>
              </li>
              <li>
                <a href="/modeles-excel" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiDownload className="mr-2 text-yellow-300" size={16} />
                  <span className="ml-1">Télécharger modèle</span>
                </a>
              </li>
            </ul>
          )}
        </div>

        {/* Section Attributions */}
        <div className="mb-2">
          <div 
            className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors"
            onClick={() => toggleSection('attributions')}
          >
            <FiUsers className="mr-3 text-blue-300" size={20} />
            <span className="font-medium">Attributions</span>
            {openSections.attributions ? <FiChevronDown className="ml-auto" /> : <FiChevronRight className="ml-auto" />}
          </div>
          {openSections.attributions && (
            <ul className="ml-6 mt-1 space-y-1">
                            <li>
                <a href="/prise-en-charge" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiPlus className="mr-2 text-green-300" size={16} />
                  <span className="ml-1">Prises en charge</span>
                </a>
              </li>
              <li>
                <a href="/attributions/nouvelle" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiPlus className="mr-2 text-green-300" size={16} />
                  <span className="ml-1">Nouvelle attribution</span>
                </a>
              </li>
              <li>
                <a href="/attributions/historique" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiFileText className="mr-2 text-blue-200" size={16} />
                  <span className="ml-1">Historique</span>
                </a>
              </li>
              <li>
                <a href="/attributions/reaffecter" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiRefreshCw className="mr-2 text-yellow-300" size={16} />
                  <span className="ml-1">Réaffectation</span>
                </a>
              </li>
            </ul>
          )}
        </div>

        {/* Section Fournisseurs */}
        <div className="mb-2">
          <div 
            className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors"
            onClick={() => toggleSection('fournisseurs')}
          >
            <FiUsers className="mr-3 text-blue-300" size={20} />
            <span className="font-medium">Fournisseurs</span>
            {openSections.fournisseurs ? <FiChevronDown className="ml-auto" /> : <FiChevronRight className="ml-auto" />}
          </div>
          {openSections.fournisseurs && (
            <ul className="ml-6 mt-1 space-y-1">
              <li>
                <a href="/GestionFournisseurs" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiUsers className="mr-2 text-blue-200" size={16} />
                  <span className="ml-1">Liste des fournisseurs</span>
                </a>
              </li>
              <li>
                <a href="/fournisseurs/ajouter" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiPlus className="mr-2 text-green-300" size={16} />
                  <span className="ml-1">Ajouter un fournisseur</span>
                </a>
              </li>
            </ul>
          )}
        </div>

        {/* Section Rapports */}
        <div className="mb-2">
          <div 
            className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors"
            onClick={() => toggleSection('rapports')}
          >
            <FiFileText className="mr-3 text-blue-300" size={20} />
            <span className="font-medium">Rapports</span>
            {openSections.rapports ? <FiChevronDown className="ml-auto" /> : <FiChevronRight className="ml-auto" />}
          </div>
          {openSections.rapports && (
            <ul className="ml-6 mt-1 space-y-1">
              <li>
                <a href="/rapports/inventaire" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiGrid className="mr-2 text-blue-200" size={16} />
                  <span className="ml-1">Inventaire complet</span>
                </a>
              </li>
              <li>
                <a href="/rapports/etat" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiBarChart className="mr-2 text-green-300" size={16} />
                  <span className="ml-1">État du parc</span>
                </a>
              </li>
              <li>
                <a href="/rapports/financier" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiDollarSign className="mr-2 text-yellow-300" size={16} />
                  <span className="ml-1">Rapport financier</span>
                </a>
              </li>
            </ul>
          )}
        </div>

        {/* Section Paramètres */}
        <div className="mb-2">
          <div 
            className="flex items-center cursor-pointer hover:bg-blue-700 p-2 rounded-lg transition-colors"
            onClick={() => toggleSection('parametres')}
          >
            <FiSettings className="mr-3 text-blue-300" size={20} />
            <span className="font-medium">Paramètres</span>
            {openSections.parametres ? <FiChevronDown className="ml-auto" /> : <FiChevronRight className="ml-auto" />}
          </div>
          {openSections.parametres && (
            <ul className="ml-6 mt-1 space-y-1">
              <li>
                <a href="/parametres/types" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiBox className="mr-2 text-blue-200" size={16} />
                  <span className="ml-1">Types de matériel</span>
                </a>
              </li>
              <li>
                <a href="/parametres/marques" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiTag className="mr-2 text-purple-300" size={16} />
                  <span className="ml-1">Marques</span>
                </a>
              </li>
              <li>
                <a href="/parametres/utilisateurs" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiUsers className="mr-2 text-green-300" size={16} />
                  <span className="ml-1">Comptes utilisateurs</span>
                </a>
              </li>
              <li>
                <a href="/parametres/configuration" className="flex items-center hover:bg-blue-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <FiSettings className="mr-2 text-yellow-300" size={16} />
                  <span className="ml-1">Configuration système</span>
                </a>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Footer du Sidebar */}
      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-blue-700 bg-blue-900/90">
        <div className="text-xs text-blue-200 text-center">
          <p>GestionParcInfo v1.0</p>
          <p className="mt-1">© 2026 Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;