import React, { useState, useEffect } from 'react';
import {
  FiPackage,
  FiClock,
  FiUser,
  FiCalendar,
  FiArrowRight,
  FiSearch,
  FiFilter,
  FiInfo,
  FiX,
  FiChevronDown,
  FiCheck,
  FiHash,
  FiTag,
  FiBriefcase,
  FiShoppingCart,
  FiLayers,
  FiRefreshCw,
  FiSliders
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getAllMateriels } from '../../services/materialService';
import { getAllBeneficiaires } from '../../services/beneficiareService';
import { getAllAchats } from '../../services/achatService';
import { getHistoriqueByMateriel } from '../../services/historiqueService';
import {
  getMaterielsByBeneficiaire,
  getMaterielsByAchat
} from '../../services/materialService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const HistoriqueMateriel = () => {
  const [materiels, setMateriels] = useState([]);
  const [filteredMateriels, setFilteredMateriels] = useState([]);
  const [selectedMateriel, setSelectedMateriel] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loadingMateriels, setLoadingMateriels] = useState(true);
  const [loadingHistorique, setLoadingHistorique] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  
  // États pour le dropdown de sélection du matériel
  const [showMaterielDropdown, setShowMaterielDropdown] = useState(false);
  const [materielSearch, setMaterielSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtres d'historique
  const [filters, setFilters] = useState({
    typeOperation: 'all',
    dateFrom: '',
    dateTo: ''
  });
  
  // Données pour les filtres
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [achats, setAchats] = useState([]);
  const [types, setTypes] = useState([]);
  
  // Filtres sélectionnés (uniquement Achat, Bénéficiaire, Type, N° Série)
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedNumeroSerie, setSelectedNumeroSerie] = useState('');
  
  // États pour les dropdowns
  const [showBeneficiaireDropdown, setShowBeneficiaireDropdown] = useState(false);
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Recherche dans les dropdowns
  const [beneficiaireSearch, setBeneficiaireSearch] = useState('');
  const [achatSearch, setAchatSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  
  const [stats, setStats] = useState({
    totalOperations: 0,
    attributions: 0,
    reaffectations: 0,
    liberations: 0
  });

  // Charger les données pour les filtres
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setLoadingFilters(true);
        const [beneficiairesRes, achatsRes, materielsRes] = await Promise.all([
          getAllBeneficiaires(),
          getAllAchats(),
          getAllMateriels()
        ]);
        
        setBeneficiaires(beneficiairesRes.data || []);
        setAchats(achatsRes.data || []);
        
        const materielsData = materielsRes.data || [];
        
        // Extraction des types uniques
        const uniqueTypes = [...new Set(materielsData.map(m =>
          m.type?.designation || m.prix?.designation || m.caracteristiques?.['Nature']
        ).filter(Boolean))];
        
        setTypes(uniqueTypes.map(t => ({ designation: t })));
        
      } catch (err) {
        console.error('Erreur chargement filtres:', err);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoadingFilters(false);
        setLoadingMateriels(false);
      }
    };
    
    loadFilterData();
  }, []);

  // Charger les matériels avec les filtres
  useEffect(() => {
    const loadFilteredMateriels = async () => {
      try {
        setLoadingMateriels(true);
        
        // Construire les paramètres de filtrage
        let response;
        
        if (selectedBeneficiaire) {
          response = await getMaterielsByBeneficiaire(selectedBeneficiaire.id);
        } else if (selectedAchat) {
          response = await getMaterielsByAchat(selectedAchat.id);
        } else {
          response = await getAllMateriels();
        }
        
        let filteredData = response.data || [];
        
        // Filtres supplémentaires côté client
        if (selectedType) {
          filteredData = filteredData.filter(m => getType(m) === selectedType.designation);
        }
        
        if (selectedNumeroSerie && selectedNumeroSerie.trim()) {
          filteredData = filteredData.filter(m => 
            m.numeroSerie?.toLowerCase().includes(selectedNumeroSerie.toLowerCase())
          );
        }
        
        setMateriels(filteredData);
        setFilteredMateriels(filteredData);
        
      } catch (err) {
        console.error('Erreur chargement matériels filtrés:', err);
        toast.error('Erreur lors du chargement des matériels');
      } finally {
        setLoadingMateriels(false);
      }
    };
    
    loadFilteredMateriels();
  }, [selectedBeneficiaire, selectedAchat, selectedType, selectedNumeroSerie]);

  // Fonctions helper pour récupérer les valeurs
  const getType = (materiel) => {
    return materiel.type?.designation || materiel.prix?.designation || materiel.caracteristiques?.['Nature'] || 'N/A';
  };

  // Filtrer les matériels pour la recherche dans le dropdown
  const searchedMateriels = filteredMateriels.filter(materiel => {
    if (!materielSearch.trim()) return true;
    const searchLower = materielSearch.toLowerCase();
    return (
      (materiel.numeroInventaire && materiel.numeroInventaire.toLowerCase().includes(searchLower)) ||
      (materiel.numeroSerie && materiel.numeroSerie.toLowerCase().includes(searchLower)) ||
      (getType(materiel).toLowerCase().includes(searchLower)) ||
      (materiel.beneficiaire?.nom && materiel.beneficiaire.nom.toLowerCase().includes(searchLower)) ||
      (materiel.beneficiaire?.prenom && materiel.beneficiaire.prenom.toLowerCase().includes(searchLower))
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
        setHistorique(response.data);
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

  const resetFilters = () => {
    setSelectedBeneficiaire(null);
    setSelectedAchat(null);
    setSelectedType(null);
    setSelectedNumeroSerie('');
    setBeneficiaireSearch('');
    setAchatSearch('');
    setTypeSearch('');
    setFilters({ typeOperation: 'all', dateFrom: '', dateTo: '' });
    setSearchTerm('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedBeneficiaire) count++;
    if (selectedAchat) count++;
    if (selectedType) count++;
    if (selectedNumeroSerie && selectedNumeroSerie.trim()) count++;
    return count;
  };

  const filterHistorique = () => {
    return historique.filter(item => {
      if (filters.typeOperation !== 'all' && item.typeOperation !== filters.typeOperation) {
        return false;
      }
      if (filters.dateFrom && new Date(item.dateOperation) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(item.dateOperation) > new Date(filters.dateTo)) {
        return false;
      }
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
      case 'ATTRIBUTION_INITIALE': return 'bg-green-100 text-green-800';
      case 'REAFFECTATION': return 'bg-blue-100 text-blue-800';
      case 'LIBERATION': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOperationIcon = (typeOperation) => {
    switch (typeOperation) {
      case 'ATTRIBUTION_INITIALE': return <FiUser className="text-green-600" />;
      case 'REAFFECTATION': return <FiArrowRight className="text-blue-600" />;
      case 'LIBERATION': return <FiPackage className="text-orange-600" />;
      default: return <FiInfo className="text-gray-600" />;
    }
  };

  const getOperationLabel = (typeOperation) => {
    switch (typeOperation) {
      case 'ATTRIBUTION_INITIALE': return 'Attribution Initiale';
      case 'REAFFECTATION': return 'Réaffectation';
      case 'LIBERATION': return 'Libération';
      default: return typeOperation;
    }
  };

  const getEtatColor = (etat) => {
    switch (etat) {
      case 'ATTRIBUE': return 'bg-green-100 text-green-800';
      case 'DISPONIBLE': return 'bg-blue-100 text-blue-800';
      case 'EN_PANNE': return 'bg-red-100 text-red-800';
      case 'EN_REPARATION': return 'bg-yellow-100 text-yellow-800';
      case 'HORS_SERVICE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrer les listes pour les dropdowns
  const filteredBeneficiaires = beneficiaires.filter(b => {
    const searchLower = beneficiaireSearch.toLowerCase();
    return (b.nom && b.nom.toLowerCase().includes(searchLower)) ||
           (b.prenom && b.prenom.toLowerCase().includes(searchLower)) ||
           (b.matricule && b.matricule.toLowerCase().includes(searchLower));
  });

  const filteredAchats = achats.filter(a => {
    const searchLower = achatSearch.toLowerCase();
    return (a.reference && a.reference.toLowerCase().includes(searchLower)) ||
           (a.fournisseur?.nom && a.fournisseur.nom.toLowerCase().includes(searchLower));
  });

  const filteredTypes = types.filter(t => {
    const searchLower = typeSearch.toLowerCase();
    return t.designation && t.designation.toLowerCase().includes(searchLower);
  });

  const filteredHistorique = filterHistorique();

  // Composant Dropdown réutilisable
  const FilterDropdown = ({
    icon: Icon,
    title,
    selected,
    dropdownOpen,
    setDropdownOpen,
    searchValue,
    setSearchValue,
    filteredList,
    onSelect,
    onClear,
    displayField,
    placeholder
  }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Icon className="text-indigo-500" size={16} />
        {title}
      </label>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`w-full p-3 border rounded-lg text-left flex justify-between items-center transition-all ${
          selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center truncate">
          {selected ? (
            <span className="text-sm font-medium text-gray-800 truncate">{displayField(selected)}</span>
          ) : (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selected && (
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX size={16} />
            </button>
          )}
          <FiChevronDown className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} size={16} />
        </div>
      </button>
      {dropdownOpen && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b sticky top-0 bg-white">
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={`Rechercher ${title.toLowerCase()}...`}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
          <div className="py-1">
            {loadingFilters ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Aucun résultat</div>
            ) : (
              filteredList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => { onSelect(item); setDropdownOpen(false); }}
                  className={`px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm ${
                    selected?.id === item.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="font-medium text-gray-800">{displayField(item)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

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

        {/* Bouton Filtres */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center relative ${
              showFilters || getActiveFiltersCount() > 0
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiFilter className="mr-2" />
            Filtres
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-white text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>

        {/* Section des filtres */}
        {showFilters && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <FiSliders className="mr-2 text-indigo-600" />
                Filtres de recherche
              </h3>
              <button
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-indigo-600 flex items-center px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                <FiRefreshCw className="mr-1" />
                Réinitialiser
              </button>
            </div>

            {/* Grille des filtres */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <FilterDropdown
                icon={FiUser}
                title="Bénéficiaire"
                selected={selectedBeneficiaire}
                dropdownOpen={showBeneficiaireDropdown}
                setDropdownOpen={setShowBeneficiaireDropdown}
                searchValue={beneficiaireSearch}
                setSearchValue={setBeneficiaireSearch}
                filteredList={filteredBeneficiaires}
                onSelect={setSelectedBeneficiaire}
                onClear={() => setSelectedBeneficiaire(null)}
                displayField={(item) => `${item.nom} ${item.prenom}`}
                placeholder="Sélectionner un bénéficiaire..."
              />
              
              <FilterDropdown
                icon={FiShoppingCart}
                title="Achat"
                selected={selectedAchat}
                dropdownOpen={showAchatDropdown}
                setDropdownOpen={setShowAchatDropdown}
                searchValue={achatSearch}
                setSearchValue={setAchatSearch}
                filteredList={filteredAchats}
                onSelect={setSelectedAchat}
                onClear={() => setSelectedAchat(null)}
                displayField={(item) => item.reference || `Achat #${item.id}`}
                placeholder="Sélectionner un achat..."
              />
              
              <FilterDropdown
                icon={FiLayers}
                title="Type"
                selected={selectedType}
                dropdownOpen={showTypeDropdown}
                setDropdownOpen={setShowTypeDropdown}
                searchValue={typeSearch}
                setSearchValue={setTypeSearch}
                filteredList={filteredTypes}
                onSelect={setSelectedType}
                onClear={() => setSelectedType(null)}
                displayField={(item) => item.designation}
                placeholder="Sélectionner un type..."
              />
              
              {/* N° Série - Input texte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiHash className="text-indigo-500" size={16} />
                  Numéro de Série
                </label>
                <input
                  type="text"
                  value={selectedNumeroSerie}
                  onChange={(e) => setSelectedNumeroSerie(e.target.value)}
                  placeholder="Rechercher par N° Série..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Indicateurs de filtres actifs */}
            {getActiveFiltersCount() > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-indigo-700 font-medium mb-3">
                  Filtres actifs ({getActiveFiltersCount()}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedBeneficiaire && (
                    <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium flex items-center gap-1">
                      <FiUser size={12} />
                      {selectedBeneficiaire.nom} {selectedBeneficiaire.prenom}
                      <button onClick={() => setSelectedBeneficiaire(null)} className="ml-1 hover:text-indigo-600">
                        <FiX size={12} />
                      </button>
                    </span>
                  )}
                  {selectedAchat && (
                    <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium flex items-center gap-1">
                      <FiShoppingCart size={12} />
                      {selectedAchat.reference || `#${selectedAchat.id}`}
                      <button onClick={() => setSelectedAchat(null)} className="ml-1 hover:text-indigo-600">
                        <FiX size={12} />
                      </button>
                    </span>
                  )}
                  {selectedType && (
                    <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium flex items-center gap-1">
                      <FiLayers size={12} />
                      {selectedType.designation}
                      <button onClick={() => setSelectedType(null)} className="ml-1 hover:text-indigo-600">
                        <FiX size={12} />
                      </button>
                    </span>
                  )}
                  {selectedNumeroSerie && selectedNumeroSerie.trim() && (
                    <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium flex items-center gap-1">
                      <FiHash size={12} />
                      {selectedNumeroSerie}
                      <button onClick={() => setSelectedNumeroSerie('')} className="ml-1 hover:text-indigo-600">
                        <FiX size={12} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sélection du matériel avec dropdown amélioré */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">
              {showFilters ? '3' : '1'}
            </span>
            Sélectionnez un matériel
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 text-xs text-indigo-600">
                ({filteredMateriels.length} résultats)
              </span>
            )}
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
                        <span className="mr-3">{getType(selectedMateriel)}</span>
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
                    onClick={(e) => { e.stopPropagation(); clearMaterielSelection(); }}
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
                      placeholder="Rechercher par n° inventaire, série, type, bénéficiaire..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                    <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {filteredMateriels.length} matériel(s) disponible(s)
                  </div>
                </div>
                <div className="py-2">
                  {loadingMateriels ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Chargement des matériels...</p>
                    </div>
                  ) : searchedMateriels.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {materielSearch.trim() === ''
                        ? 'Aucun matériel disponible'
                        : `Aucun matériel trouvé pour "${materielSearch}"`}
                    </div>
                  ) : (
                    searchedMateriels.map(materiel => (
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
                                {getType(materiel) !== 'N/A' && (
                                  <span className="flex items-center">
                                    <FiPackage className="mr-1" size={12} />
                                    {getType(materiel)}
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
                                  <span className="ml-2">({materiel.beneficiaire.matricule})</span>
                                )}
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
                    <div><span className="font-medium">N° Inventaire:</span> {selectedMateriel.numeroInventaire || 'Non défini'}</div>
                    <div><span className="font-medium">Type:</span> {getType(selectedMateriel)}</div>
                    <div><span className="font-medium">N° Série:</span> {selectedMateriel.numeroSerie || 'N/A'}</div>
                    <div><span className="font-medium">État:</span> {selectedMateriel.etat || 'N/A'}</div>
                    <div><span className="font-medium">Bénéficiaire:</span> {selectedMateriel.beneficiaire ? ` ${selectedMateriel.beneficiaire.nom} ${selectedMateriel.beneficiaire.prenom}` : ' Non attribué'}</div>
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

      {/* Filtres et recherche historique */}
      {selectedMateriel && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">
              {showFilters ? '4' : '2'}
            </span>
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
                  setFilters({ typeOperation: 'all', dateFrom: '', dateTo: '' });
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
                          <h4 className="font-medium text-gray-800 mt-1">{item.description}</h4>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0">
                          <FiCalendar className="text-gray-400 mr-1" size={14} />
                          <span className="text-sm text-gray-500">{formatDate(item.dateOperation)}</span>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {item.ancienBeneficiaireNom && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Ancien bénéficiaire</p>
                            <p className="font-medium text-gray-800">{item.ancienBeneficiaireNom}</p>
                          </div>
                        )}
                        {item.nouveauBeneficiaireNom && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Nouveau bénéficiaire</p>
                            <p className="font-medium text-gray-800">{item.nouveauBeneficiaireNom}</p>
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
            <p className="text-gray-500">Aucune opération ne correspond à vos critères de recherche</p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
          <FiPackage className="text-gray-300 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Sélectionnez un matériel</h3>
          <p className="text-gray-500">Veuillez sélectionner un matériel pour afficher son historique</p>
        </div>
      )}
    </div>
  );
};

export default HistoriqueMateriel;