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
  FiX,
  FiPackage,
  FiTruck,
  FiSliders,
  FiTag,
  FiMonitor,
  FiHardDrive,
  FiLayers
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
import { getAllFournisseurs } from '../../services/fournisseurService';

const MaterielsTable = () => {
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Données pour les filtres
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [achats, setAchats] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [systemes, setSystemes] = useState([]);
  
  // Filtres sélectionnés
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedMarque, setSelectedMarque] = useState(null);
  const [selectedSysteme, setSelectedSysteme] = useState(null);
  const [selectedEtat, setSelectedEtat] = useState('all');
  
  // États pour les dropdowns
  const [showBeneficiaireDropdown, setShowBeneficiaireDropdown] = useState(false);
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [showFournisseurDropdown, setShowFournisseurDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showMarqueDropdown, setShowMarqueDropdown] = useState(false);
  const [showSystemeDropdown, setShowSystemeDropdown] = useState(false);
  
  // Recherche dans les dropdowns
  const [beneficiaireSearch, setBeneficiaireSearch] = useState('');
  const [achatSearch, setAchatSearch] = useState('');
  const [fournisseurSearch, setFournisseurSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  const [marqueSearch, setMarqueSearch] = useState('');
  const [systemeSearch, setSystemeSearch] = useState('');
  
  const [loadingFilters, setLoadingFilters] = useState(false);

  const etatOptions = [
    { value: 'all', label: 'Tous les états', color: 'gray' },
    { value: 'DISPONIBLE', label: 'Disponible', color: 'green' },
    { value: 'ATTRIBUE', label: 'Attribué', color: 'blue' },
    { value: 'EN_PANNE', label: 'En panne', color: 'red' },
    { value: 'HORS_SERVICE', label: 'Hors service', color: 'gray' },
    { value: 'VENDU', label: 'Vendu', color: 'yellow' }
  ];

  // Charger les données pour les filtres
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setLoadingFilters(true);
        const [beneficiairesRes, achatsRes, fournisseursRes, materielsRes] = await Promise.all([
          getAllBeneficiaires(),
          getAllAchats(),
          getAllFournisseurs(),
          getAllMateriels()
        ]);
        
        setBeneficiaires(beneficiairesRes.data || []);
        setAchats(achatsRes.data || []);
        setFournisseurs(fournisseursRes.data || []);
        
        const materielsData = materielsRes.data || [];
        
        // ✅ EXTRACTION ROBUSTE DES VALEURS UNIQUES
        const uniqueTypes = [...new Set(materielsData.map(m => 
          m.type?.designation || m.prix?.designation || m.caracteristiques?.['Nature']
        ).filter(Boolean))];
        
        const uniqueMarques = [...new Set(materielsData.map(m => 
          m.marque?.nom || m.prix?.marque || m.caracteristiques?.['Marque']
        ).filter(Boolean))];
        
        const uniqueSystemes = [...new Set(materielsData.map(m => 
          m.systemeExploitation?.libelle || m.prix?.systemeExploitation || m.caracteristiques?.['Système d\'exploitation']
        ).filter(Boolean))];
        
        setTypes(uniqueTypes.map(t => ({ designation: t })));
        setMarques(uniqueMarques.map(m => ({ nom: m })));
        setSystemes(uniqueSystemes.map(s => ({ libelle: s })));
        
      } catch (err) {
        console.error('Erreur chargement filtres:', err);
      } finally {
        setLoadingFilters(false);
      }
    };
    loadFilterData();
  }, []);

  // ✅ FONCTIONS HELPER POUR RÉCUPÉRER LES VALEURS
  const getMarque = (materiel) => {
    return materiel.marque?.nom || 
           materiel.prix?.marque || 
           materiel.caracteristiques?.['Marque'] || 
           'N/A';
  };

  const getSystemeExploitation = (materiel) => {
    return materiel.systemeExploitation?.libelle || 
           materiel.prix?.systemeExploitation || 
           materiel.caracteristiques?.['Système d\'exploitation'] || 
           'N/A';
  };

  const getType = (materiel) => {
    return materiel.type?.designation || 
           materiel.prix?.designation || 
           materiel.caracteristiques?.['Nature'] || 
           'N/A';
  };

  const getFournisseur = (materiel) => {
    return materiel.fournisseur?.nom || 
           materiel.achat?.fournisseur?.nom || 
           'N/A';
  };

  // Filtrer les listes pour les dropdowns
  const filteredBeneficiaires = beneficiaires.filter(b => {
    const searchLower = beneficiaireSearch.toLowerCase();
    return (
      (b.nom && b.nom.toLowerCase().includes(searchLower)) ||
      (b.prenom && b.prenom.toLowerCase().includes(searchLower)) ||
      (b.matricule && b.matricule.toLowerCase().includes(searchLower))
    );
  });

  const filteredAchats = achats.filter(a => {
    const searchLower = achatSearch.toLowerCase();
    return (
      (a.reference && a.reference.toLowerCase().includes(searchLower)) ||
      (a.fournisseur?.nom && a.fournisseur.nom.toLowerCase().includes(searchLower))
    );
  });

  const filteredFournisseurs = fournisseurs.filter(f => {
    const searchLower = fournisseurSearch.toLowerCase();
    return (f.nom && f.nom.toLowerCase().includes(searchLower));
  });

  const filteredTypes = types.filter(t => {
    const searchLower = typeSearch.toLowerCase();
    return t.designation && t.designation.toLowerCase().includes(searchLower);
  });

  const filteredMarques = marques.filter(m => {
    const searchLower = marqueSearch.toLowerCase();
    return m.nom && m.nom.toLowerCase().includes(searchLower);
  });

  const filteredSystemes = systemes.filter(s => {
    const searchLower = systemeSearch.toLowerCase();
    return s.libelle && s.libelle.toLowerCase().includes(searchLower);
  });

  // Charger les matériels avec filtres
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;

        if (selectedBeneficiaire) {
          response = await getMaterielsByBeneficiaire(selectedBeneficiaire.id);
        } else if (selectedAchat) {
          response = await getMaterielsByAchat(selectedAchat.id);
        } else {
          if (selectedEtat === 'DISPONIBLE') {
            response = await getMaterielsDisponibles();
          } else if (selectedEtat === 'ATTRIBUE') {
            response = await getMaterielsAttribues();
          } else {
            response = await getAllMateriels();
          }
        }

        let filteredData = response.data || [];

        // Filtres supplémentaires côté client
        if (selectedFournisseur) {
          filteredData = filteredData.filter(m =>
            m.fournisseur?.id === selectedFournisseur.id ||
            m.prix?.fournisseur?.id === selectedFournisseur.id ||
            m.achat?.fournisseur?.id === selectedFournisseur.id
          );
        }
        if (selectedType) {
          filteredData = filteredData.filter(m => {
            const materielType = getType(m);
            return materielType === selectedType.designation;
          });
        }
        if (selectedMarque) {
          filteredData = filteredData.filter(m => {
            const materielMarque = getMarque(m);
            return materielMarque === selectedMarque.nom;
          });
        }
        if (selectedSysteme) {
          filteredData = filteredData.filter(m => {
            const materielSysteme = getSystemeExploitation(m);
            return materielSysteme === selectedSysteme.libelle;
          });
        }
        if (selectedEtat !== 'all' && !selectedBeneficiaire && !selectedAchat) {
          filteredData = filteredData.filter(m => m.etat === selectedEtat);
        }

        setMateriels(filteredData);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des matériels');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedBeneficiaire, selectedAchat, selectedFournisseur, selectedType, selectedMarque, selectedSysteme, selectedEtat]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (searchTerm.trim() === '') {
        const response = await getAllMateriels();
        setMateriels(response.data || []);
      } else {
        const response = await searchMateriels(searchTerm);
        setMateriels(response.data || []);
      }
      setError(null);
    } catch (err) {
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedBeneficiaire(null);
    setSelectedAchat(null);
    setSelectedFournisseur(null);
    setSelectedType(null);
    setSelectedMarque(null);
    setSelectedSysteme(null);
    setSelectedEtat('all');
    setSearchTerm('');
    setBeneficiaireSearch('');
    setAchatSearch('');
    setFournisseurSearch('');
    setTypeSearch('');
    setMarqueSearch('');
    setSystemeSearch('');
    setActiveTab('all');
    setShowBeneficiaireDropdown(false);
    setShowAchatDropdown(false);
    setShowFournisseurDropdown(false);
    setShowTypeDropdown(false);
    setShowMarqueDropdown(false);
    setShowSystemeDropdown(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedBeneficiaire) count++;
    if (selectedAchat) count++;
    if (selectedFournisseur) count++;
    if (selectedType) count++;
    if (selectedMarque) count++;
    if (selectedSysteme) count++;
    if (selectedEtat !== 'all') count++;
    return count;
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
        <Icon className="text-purple-500" size={16} />
        {title}
      </label>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`w-full p-3 border rounded-lg text-left flex justify-between items-center transition-all ${
          selected ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center truncate">
          {selected ? (
            <span className="text-sm font-medium text-gray-800 truncate">
              {displayField(selected)}
            </span>
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
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
          <div className="py-1">
            {loadingFilters ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Aucun résultat</div>
            ) : (
              filteredList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => { onSelect(item); setDropdownOpen(false); }}
                  className={`px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm ${
                    selected?.id === item.id ? 'bg-purple-50' : ''
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

  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiPackage className="text-purple-600" />
          Gestion des Matériels
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center relative ${
              showFilters || getActiveFiltersCount() > 0
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiFilter className="mr-2" />
            Filtres
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-white text-purple-600 text-xs px-2 py-0.5 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Section des filtres */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <FiSliders className="mr-2 text-purple-600" />
              Filtres de recherche
            </h3>
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-purple-600 flex items-center px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className="mr-1" />
              Réinitialiser
            </button>
          </div>

          {/* Grille des filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* État */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiTag className="text-purple-500" size={16} />
                État du matériel
              </label>
              <div className="relative">
                <select
                  value={selectedEtat}
                  onChange={(e) => setSelectedEtat(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm appearance-none bg-white"
                >
                  {etatOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            <FilterDropdown
              icon={FiTruck}
              title="Fournisseur"
              selected={selectedFournisseur}
              dropdownOpen={showFournisseurDropdown}
              setDropdownOpen={setShowFournisseurDropdown}
              searchValue={fournisseurSearch}
              setSearchValue={setFournisseurSearch}
              filteredList={filteredFournisseurs}
              onSelect={setSelectedFournisseur}
              onClear={() => setSelectedFournisseur(null)}
              displayField={(item) => item.nom}
              placeholder="Sélectionner un fournisseur..."
            />

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

            <FilterDropdown
              icon={FiMonitor}
              title="Marque"
              selected={selectedMarque}
              dropdownOpen={showMarqueDropdown}
              setDropdownOpen={setShowMarqueDropdown}
              searchValue={marqueSearch}
              setSearchValue={setMarqueSearch}
              filteredList={filteredMarques}
              onSelect={setSelectedMarque}
              onClear={() => setSelectedMarque(null)}
              displayField={(item) => item.nom}
              placeholder="Sélectionner une marque..."
            />

            <FilterDropdown
              icon={FiHardDrive}
              title="Système"
              selected={selectedSysteme}
              dropdownOpen={showSystemeDropdown}
              setDropdownOpen={setShowSystemeDropdown}
              searchValue={systemeSearch}
              setSearchValue={setSystemeSearch}
              filteredList={filteredSystemes}
              onSelect={setSelectedSysteme}
              onClear={() => setSelectedSysteme(null)}
              displayField={(item) => item.libelle}
              placeholder="Sélectionner un système..."
            />
          </div>

          {/* Indicateurs de filtres actifs */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-purple-700 font-medium mb-3">
                Filtres actifs ({getActiveFiltersCount()}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedEtat !== 'all' && (
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                    <FiTag size={12} />
                    État: {etatOptions.find(o => o.value === selectedEtat)?.label}
                    <button onClick={() => setSelectedEtat('all')} className="ml-1 hover:text-purple-600"><FiX size={12} /></button>
                  </span>
                )}
                {selectedFournisseur && (
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                    <FiTruck size={12} />
                    {selectedFournisseur.nom}
                    <button onClick={() => setSelectedFournisseur(null)} className="ml-1 hover:text-purple-600"><FiX size={12} /></button>
                  </span>
                )}
                {selectedBeneficiaire && (
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                    <FiUser size={12} />
                    {selectedBeneficiaire.nom} {selectedBeneficiaire.prenom}
                    <button onClick={() => setSelectedBeneficiaire(null)} className="ml-1 hover:text-purple-600"><FiX size={12} /></button>
                  </span>
                )}
                {selectedAchat && (
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                    <FiShoppingCart size={12} />
                    {selectedAchat.reference || `#${selectedAchat.id}`}
                    <button onClick={() => setSelectedAchat(null)} className="ml-1 hover:text-purple-600"><FiX size={12} /></button>
                  </span>
                )}
                {selectedType && (
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                    <FiLayers size={12} />
                    {selectedType.designation}
                    <button onClick={() => setSelectedType(null)} className="ml-1 hover:text-purple-600"><FiX size={12} /></button>
                  </span>
                )}
                {selectedMarque && (
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                    <FiMonitor size={12} />
                    {selectedMarque.nom}
                    <button onClick={() => setSelectedMarque(null)} className="ml-1 hover:text-purple-600"><FiX size={12} /></button>
                  </span>
                )}
                {selectedSysteme && (
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                    <FiHardDrive size={12} />
                    {selectedSysteme.libelle}
                    <button onClick={() => setSelectedSysteme(null)} className="ml-1 hover:text-purple-600"><FiX size={12} /></button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recherche globale */}
      <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par numéro d'inventaire, série, type, bénéficiaire..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiSearch />
              Rechercher
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <FiRefreshCw />
              Réinitialiser
            </button>
          </form>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marque</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Inventaire</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Série</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Système</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bénéficiaire</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                      <span className="text-gray-500">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : materiels.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FiInfo size={48} className="text-gray-300 mb-2" />
                      <p className="text-lg font-medium">Aucun matériel trouvé</p>
                    </div>
                  </td>
                </tr>
              ) : (
                materiels.map(materiel => (
                  <React.Fragment key={materiel.id}>
                    <tr
                      className={`hover:bg-gray-50 cursor-pointer ${expandedRow === materiel.id ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleRow(materiel.id)}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">#{materiel.id}</td>
                      {/* ✅ UTILISATION DES FONCTIONS HELPER */}
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{getType(materiel)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{getMarque(materiel)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{materiel.numeroInventaire || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{materiel.numeroSerie || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{getSystemeExploitation(materiel)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {materiel.beneficiaire ? `${materiel.beneficiaire.nom} ${materiel.beneficiaire.prenom}` : 'Non attribué'}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(materiel.etat)}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1"><FiEdit size={16} /></button>
                          <button className="text-red-600 hover:text-red-900 p-1"><FiTrash size={16} /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === materiel.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="9" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">Caractéristiques:</span>
                              <div className="mt-1 text-gray-600">
                                {materiel.caracteristiques ? Object.entries(materiel.caracteristiques).map(([k, v]) => (
                                  <div key={k}><span className="font-medium">{k}:</span> {v}</div>
                                )) : 'Aucune'}
                              </div>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Fournisseur:</span>
                              <div className="mt-1 text-gray-600">{getFournisseur(materiel)}</div>
                              <span className="font-semibold text-gray-700 mt-2 block">Achat:</span>
                              <div className="mt-1 text-gray-600">{materiel.achat?.reference || 'N/A'}</div>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Observations:</span>
                              <div className="mt-1 text-gray-600 bg-white p-2 rounded border">{materiel.observations || 'Aucune'}</div>
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
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{materiels.length}</span> matériel(s) affiché(s)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterielsTable;