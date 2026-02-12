import React, { useState, useEffect } from 'react';
import { 
  FiPackage, 
  FiClock, 
  FiUser, 
  FiCalendar, 
  FiArrowRight,
  FiSearch,
  FiFilter,
  FiDownload,
  FiInfo,
  FiX,
  FiChevronDown,
  FiCheck,
  FiHash,
  FiTag,
  FiBriefcase
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getAllMateriels } from '../../services/materialService';
import {
  getHistoriqueByMateriel
} from '../../services/historiqueService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const HistoriqueMateriel = () => {
  const [materiels, setMateriels] = useState([]);
  const [selectedMateriel, setSelectedMateriel] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loadingMateriels, setLoadingMateriels] = useState(true);
  const [loadingHistorique, setLoadingHistorique] = useState(false);
  
  // États pour le dropdown de sélection du matériel
  const [showMaterielDropdown, setShowMaterielDropdown] = useState(false);
  const [materielSearch, setMaterielSearch] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    typeOperation: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [stats, setStats] = useState({
    totalOperations: 0,
    attributions: 0,
    reaffectations: 0,
    liberations: 0
  });

  // Charger les matériels
  useEffect(() => {
    const loadMateriels = async () => {
      try {
        setLoadingMateriels(true);
        const response = await getAllMateriels();
        setMateriels(response.data || []);
      } catch (error) {
        console.error('Erreur chargement matériels:', error);
        toast.error('Erreur lors du chargement des matériels');
      } finally {
        setLoadingMateriels(false);
      }
    };

    loadMateriels();
  }, []);

  // Filtrer les matériels pour la recherche
  const filteredMateriels = materiels.filter(materiel => {
    if (!materielSearch.trim()) return true;
    
    const searchLower = materielSearch.toLowerCase();
    
    return (
      (materiel.numeroInventaire && materiel.numeroInventaire.toLowerCase().includes(searchLower)) ||
      (materiel.numeroSerie && materiel.numeroSerie.toLowerCase().includes(searchLower)) ||
      (materiel.type?.designation && materiel.type.designation.toLowerCase().includes(searchLower)) ||
      (materiel.marque?.nom && materiel.marque.nom.toLowerCase().includes(searchLower)) ||
      (materiel.beneficiaire?.nom && materiel.beneficiaire.nom.toLowerCase().includes(searchLower)) ||
      (materiel.beneficiaire?.prenom && materiel.beneficiaire.prenom.toLowerCase().includes(searchLower)) ||
      (materiel.beneficiaire?.matricule && materiel.beneficiaire.matricule.toLowerCase().includes(searchLower))
    );
  });

  // Charger l'historique quand un matériel est sélectionné
  useEffect(() => {
    const loadHistorique = async () => {
      if (!selectedMateriel) {
        setHistorique([]);
        return;
      }

      try {
        setLoadingHistorique(true);
const response = await getHistoriqueByMateriel(selectedMateriel.id);
setHistorique(response.data); // ← c'est ça qui contient le tableau
calculateStats(response.data);
      } catch (error) {
        console.error('Erreur chargement historique:', error);
        toast.error('Erreur lors du chargement de l\'historique');
      } finally {
        setLoadingHistorique(false);
      }
    };

    loadHistorique();
  }, [selectedMateriel]);

  const calculateStats = (data) => {
    const stats = {
      totalOperations: data.length,
      attributions: data.filter(h => h.typeOperation === 'ATTRIBUTION_INITIALE').length,
      reaffectations: data.filter(h => h.typeOperation === 'REAFFECTATION').length,
      liberations: data.filter(h => h.typeOperation === 'LIBERATION').length
    };
    setStats(stats);
  };

  const clearMaterielSelection = () => {
    setSelectedMateriel(null);
    setMaterielSearch('');
  };

  const filterHistorique = () => {
    return historique.filter(item => {
      // Filtre par type d'opération
      if (filters.typeOperation !== 'all' && item.typeOperation !== filters.typeOperation) {
        return false;
      }

      // Filtre par date
      if (filters.dateFrom && new Date(item.dateOperation) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(item.dateOperation) > new Date(filters.dateTo)) {
        return false;
      }

      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.ancienBeneficiaireNom && item.ancienBeneficiaireNom.toLowerCase().includes(searchLower)) ||
          (item.nouveauBeneficiaireNom && item.nouveauBeneficiaireNom.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const getOperationColor = (typeOperation) => {
    switch (typeOperation) {
      case 'ATTRIBUTION_INITIALE':
        return 'bg-green-100 text-green-800';
      case 'REAFFECTATION':
        return 'bg-blue-100 text-blue-800';
      case 'LIBERATION':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOperationIcon = (typeOperation) => {
    switch (typeOperation) {
      case 'ATTRIBUTION_INITIALE':
        return <FiUser className="text-green-600" />;
      case 'REAFFECTATION':
        return <FiArrowRight className="text-blue-600" />;
      case 'LIBERATION':
        return <FiPackage className="text-orange-600" />;
      default:
        return <FiInfo className="text-gray-600" />;
    }
  };

  const getOperationLabel = (typeOperation) => {
    switch (typeOperation) {
      case 'ATTRIBUTION_INITIALE':
        return 'Attribution Initiale';
      case 'REAFFECTATION':
        return 'Réaffectation';
      case 'LIBERATION':
        return 'Libération';
      default:
        return typeOperation;
    }
  };

  const getEtatColor = (etat) => {
    switch (etat) {
      case 'ATTRIBUE':
        return 'bg-green-100 text-green-800';
      case 'DISPONIBLE':
        return 'bg-blue-100 text-blue-800';
      case 'EN_PANNE':
        return 'bg-red-100 text-red-800';
      case 'EN_REPARATION':
        return 'bg-yellow-100 text-yellow-800';
      case 'HORS_SERVICE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredHistorique = filterHistorique();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-lg mr-4">
            <FiClock className="text-indigo-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Historique des Matériels</h2>
            <p className="text-gray-600">Suivez l'historique complet des attributions de chaque matériel</p>
          </div>
        </div>

        {/* Sélection du matériel avec dropdown amélioré */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
            Sélectionnez un matériel
          </h3>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMaterielDropdown(!showMaterielDropdown)}
              className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                selectedMateriel 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <FiPackage className="mr-3 text-indigo-500" />
                <div>
                  {selectedMateriel ? (
                    <>
                      <div className="font-medium text-gray-800">
                        {selectedMateriel.numeroInventaire || `Matériel #${selectedMateriel.id}`}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <span className="mr-3">{selectedMateriel.type?.designation || 'N/A'}</span>
                        <span className="mr-3">{selectedMateriel.marque?.nom || 'N/A'}</span>
                        {selectedMateriel.numeroSerie && (
                          <span className="flex items-center">
                            <FiTag className="mr-1" size={12} />
                            {selectedMateriel.numeroSerie}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">Cliquez pour sélectionner un matériel...</span>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {selectedMateriel && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearMaterielSelection();
                    }}
                    className="mr-2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={18} />
                  </button>
                )}
                <FiChevronDown className={`transition-transform ${showMaterielDropdown ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showMaterielDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-96 overflow-y-auto">
                <div className="p-3 border-b">
                  <div className="relative">
                    <input
                      type="text"
                      value={materielSearch}
                      onChange={(e) => setMaterielSearch(e.target.value)}
                      placeholder="Rechercher par n° inventaire, série, type, marque, bénéficiaire..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                    <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Tapez pour rechercher dans tous les champs du matériel
                  </div>
                </div>
                
                <div className="py-2">
                  {loadingMateriels ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Chargement des matériels...</p>
                    </div>
                  ) : filteredMateriels.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {materielSearch.trim() === '' 
                        ? 'Aucun matériel disponible' 
                        : `Aucun matériel trouvé pour "${materielSearch}"`}
                    </div>
                  ) : (
                    filteredMateriels.map(materiel => (
                      <div
                        key={materiel.id}
                        onClick={() => {
                          setSelectedMateriel(materiel);
                          setShowMaterielDropdown(false);
                          setMaterielSearch('');
                        }}
                        className={`px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          selectedMateriel?.id === materiel.id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            <FiPackage className="text-indigo-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-gray-800">
                                {materiel.numeroInventaire || `Matériel #${materiel.id}`}
                                {materiel.numeroSerie && (
                                  <span className="ml-2 text-sm text-gray-600 flex items-center">
                                    <FiTag className="mr-1" size={12} />
                                    {materiel.numeroSerie}
                                  </span>
                                )}
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${getEtatColor(materiel.etat)}`}>
                                {materiel.etat || 'N/A'}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 mt-1">
                              <div className="flex flex-wrap gap-2">
                                {materiel.type?.designation && (
                                  <span className="flex items-center">
                                    <FiPackage className="mr-1" size={12} />
                                    {materiel.type.designation}
                                  </span>
                                )}
                                {materiel.marque?.nom && (
                                  <span className="flex items-center">
                                    <FiBriefcase className="mr-1" size={12} />
                                    {materiel.marque.nom}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {materiel.beneficiaire && (
                              <div className="mt-2 text-xs text-gray-500 flex items-center">
                                <FiUser className="mr-1" size={12} />
                                <span className="font-medium">
                                  {materiel.beneficiaire.nom} {materiel.beneficiaire.prenom}
                                </span>
                                {materiel.beneficiaire.matricule && (
                                  <span className="ml-2">
                                    ({materiel.beneficiaire.matricule})
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {materiel.caracteristiques && Object.keys(materiel.caracteristiques).length > 0 && (
                              <div className="mt-2 text-xs text-gray-500 truncate">
                                {Object.entries(materiel.caracteristiques)
                                  .slice(0, 2)
                                  .map(([key, value]) => (
                                    <span key={key} className="mr-2">
                                      {key}: {value}
                                    </span>
                                  ))}
                                {Object.keys(materiel.caracteristiques).length > 2 && '...'}
                              </div>
                            )}
                          </div>
                          
                          {selectedMateriel?.id === materiel.id && (
                            <div className="ml-2">
                              <FiCheck className="text-green-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedMateriel && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheck className="text-green-500 mr-2" />
                <div className="flex-1">
                  <span className="font-medium text-green-800">Matériel sélectionné:</span>
                  <div className="text-sm text-green-700 grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
                    <div>
                      <span className="font-medium">N° Inventaire:</span> {selectedMateriel.numeroInventaire || 'Non défini'}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {selectedMateriel.type?.designation || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Marque:</span> {selectedMateriel.marque?.nom || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">N° Série:</span> {selectedMateriel.numeroSerie || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">État:</span> {selectedMateriel.etat || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Bénéficiaire:</span> 
                      {selectedMateriel.beneficiaire ? 
                        ` ${selectedMateriel.beneficiaire.nom} ${selectedMateriel.beneficiaire.prenom}` : 
                        ' Non attribué'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMaterielDropdown(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Changer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques */}
      {selectedMateriel && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <FiClock className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total des opérations</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalOperations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <FiUser className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Attributions initiales</p>
                <p className="text-2xl font-bold text-gray-800">{stats.attributions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <FiArrowRight className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Réaffectations</p>
                <p className="text-2xl font-bold text-gray-800">{stats.reaffectations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <FiPackage className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Libérations</p>
                <p className="text-2xl font-bold text-gray-800">{stats.liberations}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informations du matériel sélectionné */}
      {selectedMateriel && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <FiPackage className="mr-2 text-indigo-600" />
            Informations détaillées du matériel
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Numéro d'inventaire</p>
              <p className="font-medium text-gray-800">
                {selectedMateriel.numeroInventaire || 'Non défini'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium text-gray-800">
                {selectedMateriel.type?.designation || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Marque</p>
              <p className="font-medium text-gray-800">
                {selectedMateriel.marque?.nom || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Numéro de série</p>
              <p className="font-medium text-gray-800">
                {selectedMateriel.numeroSerie || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">État actuel</p>
              <p className="font-medium text-gray-800">
                <span className={`px-2 py-1 text-xs rounded-full ${getEtatColor(selectedMateriel.etat)}`}>
                  {selectedMateriel.etat || 'N/A'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bénéficiaire actuel</p>
              <p className="font-medium text-gray-800">
                {selectedMateriel.beneficiaire ? 
                  `${selectedMateriel.beneficiaire.nom} ${selectedMateriel.beneficiaire.prenom}` : 
                  'Non attribué'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      {selectedMateriel && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
            Filtrer l'historique
          </h3>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher dans l'historique..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.typeOperation}
                onChange={(e) => setFilters({...filters, typeOperation: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tous les types</option>
                <option value="ATTRIBUTION_INITIALE">Attributions initiales</option>
                <option value="REAFFECTATION">Réaffectations</option>
                <option value="LIBERATION">Libérations</option>
              </select>
              
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Date de début"
              />
              
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Date de fin"
              />
              
              <button
                onClick={() => {
                  setFilters({
                    typeOperation: 'all',
                    dateFrom: '',
                    dateTo: ''
                  });
                  setSearchTerm('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <FiFilter className="mr-2" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste de l'historique */}
      {selectedMateriel ? (
        loadingHistorique ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement de l'historique...</p>
          </div>
        ) : filteredHistorique.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">
                  Historique ({filteredHistorique.length} opérations)
                </h3>
                <span className="text-sm text-gray-500">
                  {selectedMateriel.numeroInventaire || `Matériel #${selectedMateriel.id}`}
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredHistorique.map((item, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-4 ${getOperationColor(item.typeOperation)}`}>
                      {getOperationIcon(item.typeOperation)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getOperationColor(item.typeOperation)}`}>
                            {getOperationLabel(item.typeOperation)}
                          </span>
                          <h4 className="font-medium text-gray-800 mt-1">
                            {item.description}
                          </h4>
                        </div>
                        
                        <div className="flex items-center mt-2 md:mt-0">
                          <FiCalendar className="text-gray-400 mr-1" size={14} />
                          <span className="text-sm text-gray-500">
                            {formatDate(item.dateOperation)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {item.ancienBeneficiaireNom && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Ancien bénéficiaire</p>
                            <p className="font-medium text-gray-800">
                              {item.ancienBeneficiaireNom}
                            </p>
                          </div>
                        )}
                        
                        {item.nouveauBeneficiaireNom && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Nouveau bénéficiaire</p>
                            <p className="font-medium text-gray-800">
                              {item.nouveauBeneficiaireNom}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {item.notes && (
                        <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <p className="text-sm text-blue-700">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
            <FiClock className="text-gray-300 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun historique trouvé</h3>
            <p className="text-gray-500">
              Aucune opération ne correspond à vos critères de recherche
            </p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
          <FiPackage className="text-gray-300 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Sélectionnez un matériel</h3>
          <p className="text-gray-500">
            Veuillez sélectionner un matériel pour afficher son historique
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoriqueMateriel;