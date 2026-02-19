import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiRefreshCw, 
  FiEdit, 
  FiTrash,
  FiInfo,
  FiFilter,
  FiUser,
  FiShoppingCart,
  FiCheck,
  FiChevronDown,
  FiX
} from 'react-icons/fi';
import { 
  getAllMateriels, 
  getMaterielsDisponibles,
  getMaterielsAttribues,
  searchMateriels,
  getMaterielsByBeneficiaire,
  getMaterielsByAchat
} from '../../services/materialService';
import { getAllBeneficiaires } from '../../services/beneficiareService';
import { getAllAchats } from '../../services/achatService';

const MaterielsTable = () => {
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [achats, setAchats] = useState([]);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [loadingFilters, setLoadingFilters] = useState(false);
  
  // États pour les dropdowns
  const [showBeneficiaireDropdown, setShowBeneficiaireDropdown] = useState(false);
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [beneficiaireSearch, setBeneficiaireSearch] = useState('');
  const [achatSearch, setAchatSearch] = useState('');

  // Charger les bénéficiaires et achats pour les filtres
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setLoadingFilters(true);
        const [beneficiairesRes, achatsRes] = await Promise.all([
          getAllBeneficiaires(),
          getAllAchats()
        ]);
        setBeneficiaires(beneficiairesRes.data || []);
        setAchats(achatsRes.data || []);
      } catch (err) {
        console.error('Erreur chargement filtres:', err);
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilterData();
  }, []);

  // Filtrer les bénéficiaires selon la recherche
  const filteredBeneficiaires = beneficiaires.filter(beneficiaire => {
    const searchLower = beneficiaireSearch.toLowerCase();
    return (
      (beneficiaire.nom && beneficiaire.nom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.prenom && beneficiaire.prenom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.matricule && beneficiaire.matricule.toLowerCase().includes(searchLower)) ||
      (beneficiaire.email && beneficiaire.email.toLowerCase().includes(searchLower))
    );
  });

  // Filtrer les achats selon la recherche
  const filteredAchats = achats.filter(achat => {
    const searchLower = achatSearch.toLowerCase();
    return (
      (achat.reference && achat.reference.toLowerCase().includes(searchLower)) ||
      (achat.numeroBonCommande && achat.numeroBonCommande.toLowerCase().includes(searchLower)) ||
      (achat.fournisseur?.nom && achat.fournisseur.nom.toLowerCase().includes(searchLower)) ||
      (achat.description && achat.description.toLowerCase().includes(searchLower))
    );
  });

  // Charger les matériels
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        
        // Appliquer les filtres si sélectionnés
        if (selectedBeneficiaire) {
          response = await getMaterielsByBeneficiaire(selectedBeneficiaire.id);
        } else if (selectedAchat) {
          response = await getMaterielsByAchat(selectedAchat.id);
        } else if (activeTab === 'disponibles') {
          response = await getMaterielsDisponibles();
        } else if (activeTab === 'attribues') {
          response = await getMaterielsAttribues();
        } else {
          response = await getAllMateriels();
        }
        console.log('Matériels chargés:', response.data);
        setMateriels(response.data || []);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des matériels');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedBeneficiaire, selectedAchat]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (searchTerm.trim() === '') {
        // Si recherche vide, revenir aux filtres actuels
        if (selectedBeneficiaire) {
          const response = await getMaterielsByBeneficiaire(selectedBeneficiaire.id);
          setMateriels(response.data || []);
        } else if (selectedAchat) {
          const response = await getMaterielsByAchat(selectedAchat.id);
          setMateriels(response.data || []);
        } else if (activeTab === 'disponibles') {
          const response = await getMaterielsDisponibles();
          setMateriels(response.data || []);
        } else if (activeTab === 'attribues') {
          const response = await getMaterielsAttribues();
          setMateriels(response.data || []);
        } else {
          const response = await getAllMateriels();
          setMateriels(response.data || []);
        }
      } else {
        // Recherche par mot-clé
        const response = await searchMateriels(searchTerm);
        setMateriels(response.data || []);
      }
      setError(null);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedBeneficiaire(null);
    setSelectedAchat(null);
    setSearchTerm('');
    setBeneficiaireSearch('');
    setAchatSearch('');
    setActiveTab('all');
    setShowBeneficiaireDropdown(false);
    setShowAchatDropdown(false);
  };

  const handleBeneficiaireSelect = (beneficiaire) => {
    setSelectedBeneficiaire(beneficiaire);
    setSelectedAchat(null);
    setActiveTab('all');
    setShowBeneficiaireDropdown(false);
    setBeneficiaireSearch('');
  };

  const handleAchatSelect = (achat) => {
    setSelectedAchat(achat);
    setSelectedBeneficiaire(null);
    setActiveTab('all');
    setShowAchatDropdown(false);
    setAchatSearch('');
  };

  const clearBeneficiaireFilter = () => {
    setSelectedBeneficiaire(null);
    setBeneficiaireSearch('');
  };

  const clearAchatFilter = () => {
    setSelectedAchat(null);
    setAchatSearch('');
  };

  const getStatusBadge = (etat) => {
    const statusMap = {
      DISPONIBLE: 'bg-green-100 text-green-800',
      ATTRIBUE: 'bg-blue-100 text-blue-800',
      EN_PANNE: 'bg-red-100 text-red-800',
      HORS_SERVICE: 'bg-gray-100 text-gray-800',
      VENDU: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMap[etat] || 'bg-gray-100 text-gray-800'}`}>
        {etat}
      </span>
    );
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading && !showFilters) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Matériels</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button 
            onClick={() => {
              setActiveTab('all');
              setSelectedBeneficiaire(null);
              setSelectedAchat(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all' && !selectedBeneficiaire && !selectedAchat
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({materiels.length})
          </button>
          <button 
            onClick={() => {
              setActiveTab('disponibles');
              setSelectedBeneficiaire(null);
              setSelectedAchat(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'disponibles' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Disponibles
          </button>
          <button 
            onClick={() => {
              setActiveTab('attribues');
              setSelectedBeneficiaire(null);
              setSelectedAchat(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'attribues' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Attribués
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
              (selectedBeneficiaire || selectedAchat)
                ? 'bg-purple-600 text-white'
                : 'bg-purple-600 text-white'
            }`}
          >
            <FiFilter className="mr-2" /> Filtres
          </button>
        </div>
      </div>

      {/* Section des filtres avancés */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <FiFilter className="mr-2" /> Filtres avancés
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiRefreshCw className="mr-1" /> Réinitialiser
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiX className="mr-1" /> Fermer
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Filtre par bénéficiaire */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
                Sélectionnez un bénéficiaire
              </h3>
              
              <div className="relative">
                <button
                  onClick={() => {
                    setShowBeneficiaireDropdown(!showBeneficiaireDropdown);
                    setShowAchatDropdown(false);
                  }}
                  className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                    selectedBeneficiaire 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <FiUser className="mr-3 text-blue-500" />
                    <div>
                      {selectedBeneficiaire ? (
                        <>
                          <div className="font-medium text-gray-800">
                            {selectedBeneficiaire.nom} {selectedBeneficiaire.prenom}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedBeneficiaire.matricule ? `${selectedBeneficiaire.matricule} • ` : ''}
                            {selectedBeneficiaire.departement?.nom || selectedBeneficiaire.service?.nom || 'N/A'}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">Cliquez pour sélectionner un bénéficiaire...</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {selectedBeneficiaire && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearBeneficiaireFilter();
                        }}
                        className="mr-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={18} />
                      </button>
                    )}
                    <FiChevronDown className={`transition-transform ${showBeneficiaireDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showBeneficiaireDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <input
                          type="text"
                          value={beneficiaireSearch}
                          onChange={(e) => setBeneficiaireSearch(e.target.value)}
                          placeholder="Rechercher un bénéficiaire..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {loadingFilters ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Chargement des bénéficiaires...</p>
                        </div>
                      ) : filteredBeneficiaires.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Aucun bénéficiaire trouvé
                        </div>
                      ) : (
                        filteredBeneficiaires.map(beneficiaire => (
                          <div
                            key={beneficiaire.id}
                            onClick={() => handleBeneficiaireSelect(beneficiaire)}
                            className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              selectedBeneficiaire?.id === beneficiaire.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-800">
                              {beneficiaire.nom} {beneficiaire.prenom}
                            </div>
                            <div className="text-sm text-gray-600 flex justify-between mt-1">
                              <span>
                                {beneficiaire.matricule ? `Matricule: ${beneficiaire.matricule}` : 'Sans matricule'}
                              </span>
                              <span>{beneficiaire.departement?.nom || beneficiaire.service?.nom || 'N/A'}</span>
                            </div>
                            {beneficiaire.email && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {beneficiaire.email}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedBeneficiaire && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <FiCheck className="text-green-500 mr-2" />
                    <div>
                      <span className="font-medium text-green-800">Bénéficiaire sélectionné:</span>
                      <div className="text-sm text-green-700">
                        {selectedBeneficiaire.nom} {selectedBeneficiaire.prenom} • 
                        {selectedBeneficiaire.matricule ? ` ${selectedBeneficiaire.matricule} •` : ''}
                        {selectedBeneficiaire.departement?.nom || selectedBeneficiaire.service?.nom || ''}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Filtre par achat */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
                Sélectionnez un achat
              </h3>
              
              <div className="relative">
                <button
                  onClick={() => {
                    setShowAchatDropdown(!showAchatDropdown);
                    setShowBeneficiaireDropdown(false);
                  }}
                  className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                    selectedAchat 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <FiShoppingCart className="mr-3 text-blue-500" />
                    <div>
                      {selectedAchat ? (
                        <>
                          <div className="font-medium text-gray-800">{selectedAchat.reference || `Achat #${selectedAchat.id}`}</div>
                          <div className="text-sm text-gray-600">
                            {selectedAchat.fournisseur?.nom || 'N/A'} • 
                            {selectedAchat.dateAchat ? ` ${new Date(selectedAchat.dateAchat).toLocaleDateString('fr-FR')}` : ''}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">Cliquez pour sélectionner un achat...</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {selectedAchat && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAchatFilter();
                        }}
                        className="mr-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={18} />
                      </button>
                    )}
                    <FiChevronDown className={`transition-transform ${showAchatDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showAchatDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <input
                          type="text"
                          value={achatSearch}
                          onChange={(e) => setAchatSearch(e.target.value)}
                          placeholder="Rechercher une référence, fournisseur..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {loadingFilters ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Chargement des achats...</p>
                        </div>
                      ) : filteredAchats.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Aucun achat trouvé
                        </div>
                      ) : (
                        filteredAchats.map(achat => (
                          <div
                            key={achat.id}
                            onClick={() => handleAchatSelect(achat)}
                            className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              selectedAchat?.id === achat.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-800">
                              {achat.reference || `Achat #${achat.id}`}
                              {achat.numeroBonCommande && ` (BC: ${achat.numeroBonCommande})`}
                            </div>
                            <div className="text-sm text-gray-600 flex justify-between mt-1">
                              <span>{achat.fournisseur?.nom || 'N/A'}</span>
                              <span>
                                {achat.dateAchat ? new Date(achat.dateAchat).toLocaleDateString('fr-FR') : 'N/A'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {achat.description ? achat.description.substring(0, 50) + (achat.description.length > 50 ? '...' : '') : 'Pas de description'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedAchat && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <FiCheck className="text-green-500 mr-2" />
                    <div>
                      <span className="font-medium text-green-800">Achat sélectionné:</span>
                      <div className="text-sm text-green-700">
                        {selectedAchat.reference || `Achat #${selectedAchat.id}`} • 
                        {selectedAchat.fournisseur?.nom ? ` ${selectedAchat.fournisseur.nom} •` : ''}
                        {selectedAchat.dateAchat ? ` ${new Date(selectedAchat.dateAchat).toLocaleDateString('fr-FR')}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Indicateurs de filtres actifs */}
          {(selectedBeneficiaire || selectedAchat) && (
            <div className="mt-6 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-700 font-medium">
                Filtre actif: 
                {selectedBeneficiaire && 
                  ` Bénéficiaire: ${selectedBeneficiaire.nom} ${selectedBeneficiaire.prenom}`
                }
                {selectedAchat && 
                  ` Achat: ${selectedAchat.reference || `#${selectedAchat.id}`}`
                }
              </p>
              {selectedBeneficiaire && (
                <p className="text-xs text-purple-600 mt-1">
                  Matériels attribués à ce bénéficiaire: {
                    materiels.filter(m => m.beneficiaire?.id === selectedBeneficiaire.id).length
                  }
                </p>
              )}
              {selectedAchat && (
                <p className="text-xs text-purple-600 mt-1">
                  Matériels provenant de cet achat: {
                    materiels.filter(m => m.achat?.id === selectedAchat.id).length
                  }
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Formulaire de recherche globale */}
      <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par numéro d'inventaire, série, type, bénéficiaire..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FiSearch className="mr-2" /> Rechercher
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <FiRefreshCw className="mr-2" /> Réinitialiser
            </button>
          </form>
        </div>
      </div>

      {/* Tableau des matériels */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marque</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Inventaire</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Série</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Système</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bénéficiaire</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Création</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                      <span className="text-gray-500">Chargement des matériels...</span>
                    </div>
                  </td>
                </tr>
              ) : materiels.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FiInfo size={48} className="text-gray-300 mb-2" />
                      <p className="text-lg font-medium">Aucun matériel trouvé</p>
                      <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos critères de recherche</p>
                    </div>
                  </td>
                </tr>
              ) : (
                materiels.map(materiel => (
                  <React.Fragment key={materiel.id}>
                    <tr 
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        expandedRow === materiel.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => toggleRow(materiel.id)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-600">#{materiel.id}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <div className="text-sm font-medium text-gray-900">{materiel.type?.designation || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{materiel.marque?.nom || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{materiel.numeroInventaire || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{materiel.numeroSerie || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{materiel.systemeExploitation?.libelle || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {materiel.beneficiaire 
                            ? `${materiel.beneficiaire.nom} ${materiel.beneficiaire.prenom || ''}`
                            : 'Non attribué'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(materiel.etat)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {materiel.dateCreation ? new Date(materiel.dateCreation).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1"
                            onClick={(e) => { e.stopPropagation(); /* TODO: Edit */ }}
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 p-1"
                            onClick={(e) => { e.stopPropagation(); /* TODO: Delete */ }}
                          >
                            <FiTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Ligne détaillée */}
                    {expandedRow === materiel.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="10" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">Caractéristiques:</span>
                              <div className="mt-1 text-gray-600 space-y-1">
                                {materiel.caracteristiques && Object.keys(materiel.caracteristiques).length > 0 ? (
                                  Object.entries(materiel.caracteristiques).map(([cle, valeur]) => (
                                    <div key={cle} className="flex">
                                      <span className="font-medium mr-2">{cle}:</span>
                                      <span>{valeur}</span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-gray-400">Aucune caractéristique</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-semibold text-gray-700">Fournisseur:</span>
                              <div className="mt-1 text-gray-600">
                                {materiel.fournisseur?.nom || 'Non spécifié'}
                              </div>
                              
                              <span className="font-semibold text-gray-700 mt-2 block">Achat:</span>
                              <div className="mt-1 text-gray-600">
                                {materiel.achat?.reference || materiel.achat?.numeroBonCommande || 'N/A'}
                              </div>
                              
                              <span className="font-semibold text-gray-700 mt-2 block">Date d'attribution:</span>
                              <div className="mt-1 text-gray-600">
                                {materiel.dateAttribution 
                                  ? new Date(materiel.dateAttribution).toLocaleDateString('fr-FR')
                                  : 'Non attribué'}
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-semibold text-gray-700">Observations:</span>
                              <div className="mt-1 text-gray-600 bg-white p-2 rounded border border-gray-200">
                                {materiel.observations || 'Aucune observation'}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {materiels.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center flex-col sm:flex-row">
            <div className="text-sm text-gray-500 mb-2 sm:mb-0">
              Affichage de <span className="font-semibold">{materiels.length}</span> matériel(s)
              {(selectedBeneficiaire || selectedAchat) && (
                <span className="ml-2 text-purple-600">
                  (filtre actif)
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                Précédent
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterielsTable;