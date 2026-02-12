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
  FiHash,
  FiTag,
  FiBriefcase,
  FiCheck,
  FiChevronDown,
  FiBox
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getAllMateriels, searchMateriels } from '../../services/materialService';
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
  
  // États pour les dropdowns de recherche
  const [showNumeroInventaireDropdown, setShowNumeroInventaireDropdown] = useState(false);
  const [showNumeroSerieDropdown, setShowNumeroSerieDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showMarqueDropdown, setShowMarqueDropdown] = useState(false);
  const [showBeneficiaireDropdown, setShowBeneficiaireDropdown] = useState(false);
  
  const [numeroInventaireSearch, setNumeroInventaireSearch] = useState('');
  const [numeroSerieSearch, setNumeroSerieSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  const [marqueSearch, setMarqueSearch] = useState('');
  const [beneficiaireSearch, setBeneficiaireSearch] = useState('');
  
  const [selectedNumeroInventaire, setSelectedNumeroInventaire] = useState(null);
  const [selectedNumeroSerie, setSelectedNumeroSerie] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedMarque, setSelectedMarque] = useState(null);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  
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

  // Extraire les valeurs uniques pour les filtres
  const uniqueTypes = [...new Set(materiels
    .map(m => m.type?.designation)
    .filter(Boolean)
  )];

  const uniqueMarques = [...new Set(materiels
    .map(m => m.marque?.nom)
    .filter(Boolean)
  )];

  const uniqueNumerosInventaire = materiels
    .map(m => m.numeroInventaire)
    .filter(Boolean);

  const uniqueNumerosSerie = materiels
    .map(m => m.numeroSerie)
    .filter(Boolean);

  const uniqueBeneficiaires = materiels
    .filter(m => m.beneficiaire)
    .map(m => ({
      id: m.beneficiaire.id,
      nom: `${m.beneficiaire.nom} ${m.beneficiaire.prenom}`,
      matricule: m.beneficiaire.matricule,
      departement: m.beneficiaire.departement?.nom
    }))
    .filter((value, index, self) => 
      self.findIndex(b => b.id === value.id) === index
    );

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

  // Filtrer les matériels en fonction des critères sélectionnés
  useEffect(() => {
    let filtered = [...materiels];
    
    if (selectedNumeroInventaire) {
      filtered = filtered.filter(m => m.numeroInventaire === selectedNumeroInventaire);
    }
    
    if (selectedNumeroSerie) {
      filtered = filtered.filter(m => m.numeroSerie === selectedNumeroSerie);
    }
    
    if (selectedType) {
      filtered = filtered.filter(m => m.type?.designation === selectedType);
    }
    
    if (selectedMarque) {
      filtered = filtered.filter(m => m.marque?.nom === selectedMarque);
    }
    
    if (selectedBeneficiaire) {
      filtered = filtered.filter(m => m.beneficiaire?.id === selectedBeneficiaire.id);
    }
    
    // Si un matériel est sélectionné mais ne correspond plus aux filtres, le désélectionner
    if (selectedMateriel && !filtered.find(m => m.id === selectedMateriel.id)) {
      setSelectedMateriel(null);
    }
  }, [selectedNumeroInventaire, selectedNumeroSerie, selectedType, selectedMarque, selectedBeneficiaire, materiels]);

  // Charger l'historique quand un matériel est sélectionné
  useEffect(() => {
    const loadHistorique = async () => {
      if (!selectedMateriel) {
        setHistorique([]);
        return;
      }

      try {
        setLoadingHistorique(true);
        const data = await getHistoriqueByMateriel(selectedMateriel.id);
        setHistorique(data);
        
        // Calculer les statistiques
        calculateStats(data);
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

  const resetAllFilters = () => {
    setSelectedNumeroInventaire(null);
    setSelectedNumeroSerie(null);
    setSelectedType(null);
    setSelectedMarque(null);
    setSelectedBeneficiaire(null);
    setNumeroInventaireSearch('');
    setNumeroSerieSearch('');
    setTypeSearch('');
    setMarqueSearch('');
    setBeneficiaireSearch('');
    setSelectedMateriel(null);
    setShowNumeroInventaireDropdown(false);
    setShowNumeroSerieDropdown(false);
    setShowTypeDropdown(false);
    setShowMarqueDropdown(false);
    setShowBeneficiaireDropdown(false);
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

        {/* Filtres de recherche avancée */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {/* Filtre par numéro d'inventaire */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Numéro d'inventaire
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNumeroInventaireDropdown(!showNumeroInventaireDropdown);
                  setShowNumeroSerieDropdown(false);
                  setShowTypeDropdown(false);
                  setShowMarqueDropdown(false);
                  setShowBeneficiaireDropdown(false);
                }}
                className={`w-full p-3 border rounded-lg text-left flex justify-between items-center transition-all ${
                  selectedNumeroInventaire 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <FiHash className="mr-2 text-blue-500" />
                  <span className={selectedNumeroInventaire ? 'text-gray-800' : 'text-gray-500'}>
                    {selectedNumeroInventaire || 'Rechercher par n° inventaire...'}
                  </span>
                </div>
                <div className="flex items-center">
                  {selectedNumeroInventaire && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNumeroInventaire(null);
                      }}
                      className="mr-2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                  <FiChevronDown className={`transition-transform ${showNumeroInventaireDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showNumeroInventaireDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <input
                        type="text"
                        value={numeroInventaireSearch}
                        onChange={(e) => setNumeroInventaireSearch(e.target.value)}
                        placeholder="Rechercher un n° inventaire..."
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                    </div>
                  </div>
                  
                  <div className="py-1">
                    {uniqueNumerosInventaire
                      .filter(num => 
                        !numeroInventaireSearch || 
                        num.toLowerCase().includes(numeroInventaireSearch.toLowerCase())
                      )
                      .map((numero, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedNumeroInventaire(numero);
                            setShowNumeroInventaireDropdown(false);
                            setNumeroInventaireSearch('');
                          }}
                          className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            selectedNumeroInventaire === numero ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="text-sm text-gray-800">{numero}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filtre par numéro de série */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Numéro de série
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNumeroSerieDropdown(!showNumeroSerieDropdown);
                  setShowNumeroInventaireDropdown(false);
                  setShowTypeDropdown(false);
                  setShowMarqueDropdown(false);
                  setShowBeneficiaireDropdown(false);
                }}
                className={`w-full p-3 border rounded-lg text-left flex justify-between items-center transition-all ${
                  selectedNumeroSerie 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <FiTag className="mr-2 text-blue-500" />
                  <span className={selectedNumeroSerie ? 'text-gray-800' : 'text-gray-500'}>
                    {selectedNumeroSerie || 'Rechercher par n° série...'}
                  </span>
                </div>
                <div className="flex items-center">
                  {selectedNumeroSerie && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNumeroSerie(null);
                      }}
                      className="mr-2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                  <FiChevronDown className={`transition-transform ${showNumeroSerieDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showNumeroSerieDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <input
                        type="text"
                        value={numeroSerieSearch}
                        onChange={(e) => setNumeroSerieSearch(e.target.value)}
                        placeholder="Rechercher un n° de série..."
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                    </div>
                  </div>
                  
                  <div className="py-1">
                    {uniqueNumerosSerie
                      .filter(num => 
                        !numeroSerieSearch || 
                        num.toLowerCase().includes(numeroSerieSearch.toLowerCase())
                      )
                      .map((numero, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedNumeroSerie(numero);
                            setShowNumeroSerieDropdown(false);
                            setNumeroSerieSearch('');
                          }}
                          className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            selectedNumeroSerie === numero ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="text-sm text-gray-800">{numero}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filtre par type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Type de matériel
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowTypeDropdown(!showTypeDropdown);
                  setShowNumeroInventaireDropdown(false);
                  setShowNumeroSerieDropdown(false);
                  setShowMarqueDropdown(false);
                  setShowBeneficiaireDropdown(false);
                }}
                className={`w-full p-3 border rounded-lg text-left flex justify-between items-center transition-all ${
                  selectedType 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <FiPackage className="mr-2 text-blue-500" />
                  <span className={selectedType ? 'text-gray-800' : 'text-gray-500'}>
                    {selectedType || 'Rechercher par type...'}
                  </span>
                </div>
                <div className="flex items-center">
                  {selectedType && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedType(null);
                      }}
                      className="mr-2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                  <FiChevronDown className={`transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showTypeDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <input
                        type="text"
                        value={typeSearch}
                        onChange={(e) => setTypeSearch(e.target.value)}
                        placeholder="Rechercher un type..."
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                    </div>
                  </div>
                  
                  <div className="py-1">
                    {uniqueTypes
                      .filter(type => 
                        !typeSearch || 
                        type.toLowerCase().includes(typeSearch.toLowerCase())
                      )
                      .map((type, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedType(type);
                            setShowTypeDropdown(false);
                            setTypeSearch('');
                          }}
                          className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            selectedType === type ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="text-sm text-gray-800">{type}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filtre par marque */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Marque
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowMarqueDropdown(!showMarqueDropdown);
                  setShowNumeroInventaireDropdown(false);
                  setShowNumeroSerieDropdown(false);
                  setShowTypeDropdown(false);
                  setShowBeneficiaireDropdown(false);
                }}
                className={`w-full p-3 border rounded-lg text-left flex justify-between items-center transition-all ${
                  selectedMarque 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <FiBriefcase className="mr-2 text-blue-500" />
                  <span className={selectedMarque ? 'text-gray-800' : 'text-gray-500'}>
                    {selectedMarque || 'Rechercher par marque...'}
                  </span>
                </div>
                <div className="flex items-center">
                  {selectedMarque && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMarque(null);
                      }}
                      className="mr-2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                  <FiChevronDown className={`transition-transform ${showMarqueDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showMarqueDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <input
                        type="text"
                        value={marqueSearch}
                        onChange={(e) => setMarqueSearch(e.target.value)}
                        placeholder="Rechercher une marque..."
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                    </div>
                  </div>
                  
                  <div className="py-1">
                    {uniqueMarques
                      .filter(marque => 
                        !marqueSearch || 
                        marque.toLowerCase().includes(marqueSearch.toLowerCase())
                      )
                      .map((marque, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedMarque(marque);
                            setShowMarqueDropdown(false);
                            setMarqueSearch('');
                          }}
                          className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            selectedMarque === marque ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="text-sm text-gray-800">{marque}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filtre par bénéficiaire */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Bénéficiaire
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowBeneficiaireDropdown(!showBeneficiaireDropdown);
                  setShowNumeroInventaireDropdown(false);
                  setShowNumeroSerieDropdown(false);
                  setShowTypeDropdown(false);
                  setShowMarqueDropdown(false);
                }}
                className={`w-full p-3 border rounded-lg text-left flex justify-between items-center transition-all ${
                  selectedBeneficiaire 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <FiUser className="mr-2 text-blue-500" />
                  <span className={selectedBeneficiaire ? 'text-gray-800' : 'text-gray-500'}>
                    {selectedBeneficiaire ? selectedBeneficiaire.nom : 'Rechercher un bénéficiaire...'}
                  </span>
                </div>
                <div className="flex items-center">
                  {selectedBeneficiaire && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBeneficiaire(null);
                      }}
                      className="mr-2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                  <FiChevronDown className={`transition-transform ${showBeneficiaireDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showBeneficiaireDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <input
                        type="text"
                        value={beneficiaireSearch}
                        onChange={(e) => setBeneficiaireSearch(e.target.value)}
                        placeholder="Rechercher un bénéficiaire..."
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                    </div>
                  </div>
                  
                  <div className="py-1">
                    {uniqueBeneficiaires
                      .filter(benef => 
                        !beneficiaireSearch || 
                        benef.nom.toLowerCase().includes(beneficiaireSearch.toLowerCase()) ||
                        benef.matricule?.toLowerCase().includes(beneficiaireSearch.toLowerCase())
                      )
                      .map((benef, index) => (
                        <div
                          key={benef.id}
                          onClick={() => {
                            setSelectedBeneficiaire(benef);
                            setShowBeneficiaireDropdown(false);
                            setBeneficiaireSearch('');
                          }}
                          className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            selectedBeneficiaire?.id === benef.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-800 text-sm">{benef.nom}</div>
                          <div className="text-xs text-gray-600">
                            {benef.matricule ? `Matricule: ${benef.matricule}` : ''}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bouton de réinitialisation */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 opacity-0">
              Réinitialiser
            </label>
            <button
              onClick={resetAllFilters}
              className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <FiX className="mr-2" />
              Réinitialiser tous les filtres
            </button>
          </div>
        </div>

        {/* Sélection du matériel après filtrage */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un matériel
          </label>
          <div className="relative">
            <select
              value={selectedMateriel?.id || ''}
              onChange={(e) => {
                const materielId = e.target.value;
                const materiel = materiels.find(m => m.id === parseInt(materielId));
                setSelectedMateriel(materiel || null);
              }}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loadingMateriels}
            >
              <option value="">Choisir un matériel dans la liste filtrée...</option>
              {materiels
                .filter(m => {
                  if (selectedNumeroInventaire && m.numeroInventaire !== selectedNumeroInventaire) return false;
                  if (selectedNumeroSerie && m.numeroSerie !== selectedNumeroSerie) return false;
                  if (selectedType && m.type?.designation !== selectedType) return false;
                  if (selectedMarque && m.marque?.nom !== selectedMarque) return false;
                  if (selectedBeneficiaire && m.beneficiaire?.id !== selectedBeneficiaire.id) return false;
                  return true;
                })
                .map(materiel => (
                  <option key={materiel.id} value={materiel.id}>
                    {materiel.numeroInventaire || `Matériel #${materiel.id}`} - 
                    {materiel.type?.designation ? ` ${materiel.type.designation}` : ''} - 
                    {materiel.marque?.nom ? ` ${materiel.marque.nom}` : ''}
                    {materiel.beneficiaire ? ` (${materiel.beneficiaire.nom} ${materiel.beneficiaire.prenom})` : ' (Non attribué)'}
                  </option>
                ))}
            </select>
            {loadingMateriels && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {materiels.filter(m => {
              if (selectedNumeroInventaire && m.numeroInventaire !== selectedNumeroInventaire) return false;
              if (selectedNumeroSerie && m.numeroSerie !== selectedNumeroSerie) return false;
              if (selectedType && m.type?.designation !== selectedType) return false;
              if (selectedMarque && m.marque?.nom !== selectedMarque) return false;
              if (selectedBeneficiaire && m.beneficiaire?.id !== selectedBeneficiaire.id) return false;
              return true;
            }).length} matériel(s) correspondant aux critères
          </div>
        </div>
      </div>

      {/* Le reste du composant reste inchangé */}
      {/* ... (Statistiques, Informations du matériel, Filtres de l'historique, Liste de l'historique) ... */}
    </div>
  );
};

export default HistoriqueMateriel;