import React, { useState, useEffect, useRef } from 'react';
import {
  FiSearch,
  FiRefreshCw,
  FiEdit,
  FiTrash,
  FiInfo,
  FiUser,
  FiShoppingCart,
  FiCheck,
  FiChevronDown,
  FiX,
  FiPackage,
  FiTruck,
  FiTag,
  FiMonitor,
  FiHardDrive,
  FiLayers,
  FiCalendar,
  FiUserPlus,
  FiSliders
} from 'react-icons/fi';
import {
  getAllMateriels,
  attribuerMateriel,
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
  const [filteredMateriels, setFilteredMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);

  // Données pour les listes déroulantes
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [achats, setAchats] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [systemes, setSystemes] = useState([]);
  const [exercices, setExercices] = useState([]);

  // États pour les filtres par colonne
  const [columnFilters, setColumnFilters] = useState({
    id: '',
    exercice: '',
    type: '',
    marque: '',
    numeroInventaire: '',
    numeroSerie: '',
    systeme: '',
    numeroSerieEcran: '',
    beneficiaire: '',
    etat: ''
  });

  // États pour gérer l'affichage des champs de filtre par colonne
  const [activeFilterInput, setActiveFilterInput] = useState(null);
  const filterInputRefs = useRef({});

  // États pour les filtres avancés
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEtat, setSelectedEtat] = useState('all');
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedMarque, setSelectedMarque] = useState(null);
  const [selectedSysteme, setSelectedSysteme] = useState(null);
  const [selectedExercice, setSelectedExercice] = useState(null);

  // États pour les dropdowns des filtres avancés
  const [showFournisseurDropdown, setShowFournisseurDropdown] = useState(false);
  const [showBeneficiaireDropdown, setShowBeneficiaireDropdown] = useState(false);
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showMarqueDropdown, setShowMarqueDropdown] = useState(false);
  const [showSystemeDropdown, setShowSystemeDropdown] = useState(false);
  const [showExerciceDropdown, setShowExerciceDropdown] = useState(false);

  // Recherche dans les dropdowns
  const [fournisseurSearch, setFournisseurSearch] = useState('');
  const [beneficiaireSearch, setBeneficiaireSearch] = useState('');
  const [achatSearch, setAchatSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  const [marqueSearch, setMarqueSearch] = useState('');
  const [systemeSearch, setSystemeSearch] = useState('');
  const [exerciceSearch, setExerciceSearch] = useState('');

  // États pour le modal d'attribution
  const [showAttributionModal, setShowAttributionModal] = useState(false);
  const [selectedMaterielForAttribution, setSelectedMaterielForAttribution] = useState(null);
  const [selectedBeneficiaireForAttribution, setSelectedBeneficiaireForAttribution] = useState(null);
  const [attributionDate, setAttributionDate] = useState(new Date().toISOString().split('T')[0]);
  const [attributing, setAttributing] = useState(false);
  const [beneficiaireSearchModal, setBeneficiaireSearchModal] = useState('');
  const [showBeneficiaireDropdownModal, setShowBeneficiaireDropdownModal] = useState(false);

  const [loadingFilters, setLoadingFilters] = useState(false);

  // Fermer le champ de filtre lors du clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeFilterInput && filterInputRefs.current[activeFilterInput] && 
          !filterInputRefs.current[activeFilterInput].contains(event.target)) {
        setActiveFilterInput(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeFilterInput]);

  const etatOptions = [
    { value: 'all', label: 'Tous les états', color: 'gray' },
    { value: 'DISPONIBLE', label: 'Disponible', color: 'green' },
    { value: 'ATTRIBUE', label: 'Attribué', color: 'blue' },
    { value: 'EN_PANNE', label: 'En panne', color: 'red' },
    { value: 'HORS_SERVICE', label: 'Hors service', color: 'gray' },
    { value: 'VENDU', label: 'Vendu', color: 'yellow' }
  ];

  // Charger les données pour les listes déroulantes (bénéficiaires, achats, etc.)
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

        // Extraction des valeurs uniques pour les listes
        const uniqueTypes = [...new Set(materielsData.map(m =>
          m.type?.designation || m.prix?.designation || m.caracteristiques?.['Nature']
        ).filter(Boolean))];

        const uniqueMarques = [...new Set(materielsData.map(m =>
          m.marque?.nom || m.prix?.marque || m.caracteristiques?.['Marque']
        ).filter(Boolean))];

        const uniqueSystemes = [...new Set(materielsData.map(m =>
          m.systemeExploitation?.libelle || m.prix?.systemeExploitation || m.caracteristiques?.['Système d\'exploitation']
        ).filter(Boolean))];

        const uniqueExercices = [...new Set(materielsData.map(m =>
          m.exercice
        ).filter(e => e && e.trim() !== ''))].sort((a, b) => b - a);

        setTypes(uniqueTypes.map(t => ({ designation: t })));
        setMarques(uniqueMarques.map(m => ({ nom: m })));
        setSystemes(uniqueSystemes.map(s => ({ libelle: s })));
        setExercices(uniqueExercices);
      } catch (err) {
        console.error('Erreur chargement filtres:', err);
      } finally {
        setLoadingFilters(false);
      }
    };
    loadFilterData();
  }, []);

  // Fonctions helper pour extraire les valeurs
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

  const getExercice = (materiel) => {
    return materiel.exercice || 'N/A';
  };

  // Charger les matériels selon les filtres avancés (comportement de la première version)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;

        // Priorité aux filtres spécifiques
        if (selectedBeneficiaire) {
          response = await getMaterielsByBeneficiaire(selectedBeneficiaire.id);
        } else if (selectedAchat) {
          response = await getMaterielsByAchat(selectedAchat.id);
        } else {
          // Filtres généraux
          if (selectedEtat === 'DISPONIBLE') {
            response = await getMaterielsDisponibles();
          } else if (selectedEtat === 'ATTRIBUE') {
            response = await getMaterielsAttribues();
          } else {
            response = await getAllMateriels();
          }
        }

        let data = response.data || [];

        // Filtres supplémentaires côté client (car certaines API ne supportent pas tous les filtres)
        if (selectedFournisseur) {
          data = data.filter(m =>
            m.fournisseur?.id === selectedFournisseur.id ||
            m.prix?.fournisseur?.id === selectedFournisseur.id ||
            m.achat?.fournisseur?.id === selectedFournisseur.id
          );
        }
        if (selectedType) {
          data = data.filter(m => getType(m) === selectedType.designation);
        }
        if (selectedMarque) {
          data = data.filter(m => getMarque(m) === selectedMarque.nom);
        }
        if (selectedSysteme) {
          data = data.filter(m => getSystemeExploitation(m) === selectedSysteme.libelle);
        }
        if (selectedExercice) {
          data = data.filter(m => m.exercice === selectedExercice);
        }
        // Ne pas refiltrer par état si déjà filtré par l'API (pour éviter les doublons)
        if (selectedEtat !== 'all' && !selectedBeneficiaire && !selectedAchat) {
          data = data.filter(m => m.etat === selectedEtat);
        }

        setMateriels(data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des matériels');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedBeneficiaire, selectedAchat, selectedEtat, selectedFournisseur, selectedType, selectedMarque, selectedSysteme, selectedExercice]);

  // Appliquer les filtres par colonne sur les matériels chargés
  useEffect(() => {
    let filtered = [...materiels];

    if (columnFilters.id) {
      filtered = filtered.filter(m => m.id.toString().includes(columnFilters.id));
    }
    if (columnFilters.exercice) {
      filtered = filtered.filter(m => (m.exercice || '').toLowerCase().includes(columnFilters.exercice.toLowerCase()));
    }
    if (columnFilters.type) {
      filtered = filtered.filter(m => getType(m).toLowerCase().includes(columnFilters.type.toLowerCase()));
    }
    if (columnFilters.marque) {
      filtered = filtered.filter(m => getMarque(m).toLowerCase().includes(columnFilters.marque.toLowerCase()));
    }
    if (columnFilters.numeroInventaire) {
      filtered = filtered.filter(m => (m.numeroInventaire || '').toLowerCase().includes(columnFilters.numeroInventaire.toLowerCase()));
    }
    if (columnFilters.numeroSerie) {
      filtered = filtered.filter(m => (m.numeroSerie || '').toLowerCase().includes(columnFilters.numeroSerie.toLowerCase()));
    }
    if (columnFilters.systeme) {
      filtered = filtered.filter(m => getSystemeExploitation(m).toLowerCase().includes(columnFilters.systeme.toLowerCase()));
    }
    if (columnFilters.numeroSerieEcran) {
      filtered = filtered.filter(m => (m.numeroSerieEcran || '').toLowerCase().includes(columnFilters.numeroSerieEcran.toLowerCase()));
    }
    if (columnFilters.beneficiaire) {
      filtered = filtered.filter(m => {
        const benef = m.beneficiaire ? `${m.beneficiaire.nom} ${m.beneficiaire.prenom}`.toLowerCase() : '';
        return benef.includes(columnFilters.beneficiaire.toLowerCase());
      });
    }
    if (columnFilters.etat) {
      filtered = filtered.filter(m => (m.etat || '').toLowerCase().includes(columnFilters.etat.toLowerCase()));
    }

    setFilteredMateriels(filtered);
  }, [materiels, columnFilters]);

  // Gérer le changement des filtres par colonne
  const handleFilterChange = (column, value) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
  };

  // Réinitialiser tous les filtres (avancés et colonnes)
  const resetFilters = () => {
    setSelectedEtat('all');
    setSelectedFournisseur(null);
    setSelectedBeneficiaire(null);
    setSelectedAchat(null);
    setSelectedType(null);
    setSelectedMarque(null);
    setSelectedSysteme(null);
    setSelectedExercice(null);
    setColumnFilters({
      id: '',
      exercice: '',
      type: '',
      marque: '',
      numeroInventaire: '',
      numeroSerie: '',
      systeme: '',
      numeroSerieEcran: '',
      beneficiaire: '',
      etat: ''
    });
    // Revenir à l'onglet "Tous"
    setActiveTab('all');
  };

  // Fonction pour compter les filtres avancés actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedEtat !== 'all') count++;
    if (selectedFournisseur) count++;
    if (selectedBeneficiaire) count++;
    if (selectedAchat) count++;
    if (selectedType) count++;
    if (selectedMarque) count++;
    if (selectedSysteme) count++;
    if (selectedExercice) count++;
    return count;
  };

  // Compter les filtres de colonne actifs
  const getActiveColumnFiltersCount = () => {
    return Object.values(columnFilters).filter(value => value && value.trim() !== '').length;
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
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

  const handleAttributionClick = (e, materiel) => {
    e.stopPropagation();
    setSelectedMaterielForAttribution(materiel);
    setSelectedBeneficiaireForAttribution(null);
    setAttributionDate(new Date().toISOString().split('T')[0]);
    setShowAttributionModal(true);
  };

  const handleAttribuer = async () => {
    if (!selectedBeneficiaireForAttribution) {
      alert('Veuillez sélectionner un bénéficiaire');
      return;
    }

    try {
      setAttributing(true);
      const dto = {
        materielId: selectedMaterielForAttribution.id,
        beneficiaireId: selectedBeneficiaireForAttribution.id,
        dateAttribution: attributionDate
      };
      await attribuerMateriel(dto);
      // Recharger la liste (en conservant les filtres actuels)
      const response = await getAllMateriels();
      setMateriels(response.data || []);
      setShowAttributionModal(false);
      alert('Matériel attribué avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'attribution:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'attribution du matériel');
    } finally {
      setAttributing(false);
    }
  };

  // Filtrer les bénéficiaires pour le modal
  const filteredBeneficiairesModal = beneficiaires.filter(b => {
    const searchLower = beneficiaireSearchModal.toLowerCase();
    return (
      (b.nom && b.nom.toLowerCase().includes(searchLower)) ||
      (b.prenom && b.prenom.toLowerCase().includes(searchLower)) ||
      (b.matricule && b.matricule.toLowerCase().includes(searchLower))
    );
  });

  // Filtrer les listes pour les dropdowns des filtres avancés
  const filteredFournisseurs = fournisseurs.filter(f =>
    f.nom?.toLowerCase().includes(fournisseurSearch.toLowerCase())
  );
  const filteredBeneficiaires = beneficiaires.filter(b =>
    `${b.nom} ${b.prenom}`.toLowerCase().includes(beneficiaireSearch.toLowerCase())
  );
  const filteredAchats = achats.filter(a =>
    (a.reference || `Achat #${a.id}`).toLowerCase().includes(achatSearch.toLowerCase())
  );
  const filteredTypes = types.filter(t =>
    t.designation?.toLowerCase().includes(typeSearch.toLowerCase())
  );
  const filteredMarques = marques.filter(m =>
    m.nom?.toLowerCase().includes(marqueSearch.toLowerCase())
  );
  const filteredSystemes = systemes.filter(s =>
    s.libelle?.toLowerCase().includes(systemeSearch.toLowerCase())
  );
  const filteredExercices = exercices.filter(e =>
    e?.toLowerCase().includes(exerciceSearch.toLowerCase())
  );

  // Composant ColumnFilter pour les filtres par colonne avec icône
  const ColumnFilter = ({ column, label, value, placeholder }) => {
    const isActive = activeFilterInput === column;
    const hasValue = value && value.trim() !== '';

    return (
      <div className="relative inline-flex items-center gap-1" ref={el => filterInputRefs.current[column] = el}>
        <span className="text-xs font-medium text-gray-500 uppercase">{label}</span>
        <button
          onClick={() => setActiveFilterInput(isActive ? null : column)}
          className={`p-1 rounded-full transition-colors ${
            hasValue 
              ? 'text-purple-600 bg-purple-100' 
              : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
          }`}
          title={hasValue ? `Filtré: ${value}` : 'Filtrer cette colonne'}
        >
          <FiSearch size={14} />
        </button>
        {isActive && (
          <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-300 rounded-lg shadow-lg p-2 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={(e) => handleFilterChange(column, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              {hasValue && (
                <button
                  onClick={() => {
                    handleFilterChange(column, '');
                    setActiveFilterInput(null);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
            {hasValue && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-purple-600">
                  Filtre actif: "{value}"
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Composant FilterDropdown pour les filtres avancés
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
                    selected?.id === item.id || selected === item ? 'bg-purple-50' : ''
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
      {/* Styles pour le tableau avec filtres */}
      <style jsx>{`
        .table-container {
          overflow-x: auto;
          max-width: 100%;
          border-radius: 0.5rem;
        }
        .materiels-table {
          min-width: 1500px;
          width: 100%;
          border-collapse: collapse;
        }
        .materiels-table th {
          position: sticky;
          top: 0;
          background-color: #f9fafb;
          z-index: 10;
          white-space: nowrap;
          vertical-align: top;
          padding: 0.75rem 0.5rem;
        }
        .materiels-table td {
          padding: 1rem 0.5rem;
          white-space: nowrap;
        }
      `}</style>

      {/* En-tête avec onglets et bouton d'affichage des filtres */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiPackage className="text-purple-600" />
          Gestion des Matériels
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveTab('DISPONIBLE')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'DISPONIBLE'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Disponibles
            </button>
            <button
              onClick={() => setActiveTab('ATTRIBUE')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'ATTRIBUE'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Attribués
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center relative ${
              showFilters || getActiveFiltersCount() > 0
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiSliders className="mr-2" />
            Filtres avancés
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-white text-purple-600 text-xs px-2 py-0.5 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Section des filtres avancés */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <FilterDropdown
              icon={FiCalendar}
              title="Exercice"
              selected={selectedExercice}
              dropdownOpen={showExerciceDropdown}
              setDropdownOpen={setShowExerciceDropdown}
              searchValue={exerciceSearch}
              setSearchValue={setExerciceSearch}
              filteredList={filteredExercices}
              onSelect={setSelectedExercice}
              onClear={() => setSelectedExercice(null)}
              displayField={(item) => item}
              placeholder="Sélectionner un exercice..."
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
                {selectedExercice && (
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                    <FiCalendar size={12} />
                    Exercice: {selectedExercice}
                    <button onClick={() => setSelectedExercice(null)} className="ml-1 hover:text-purple-600"><FiX size={12} /></button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indicateur des filtres de colonne actifs */}
      {getActiveColumnFiltersCount() > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Filtres de colonne actifs:</span>
          {columnFilters.exercice && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
              Exercice: {columnFilters.exercice}
              <button onClick={() => handleFilterChange('exercice', '')}><FiX size={10} /></button>
            </span>
          )}
          {columnFilters.type && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
              Type: {columnFilters.type}
              <button onClick={() => handleFilterChange('type', '')}><FiX size={10} /></button>
            </span>
          )}
          {columnFilters.marque && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
              Marque: {columnFilters.marque}
              <button onClick={() => handleFilterChange('marque', '')}><FiX size={10} /></button>
            </span>
          )}
          {columnFilters.numeroInventaire && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
              N° Inventaire: {columnFilters.numeroInventaire}
              <button onClick={() => handleFilterChange('numeroInventaire', '')}><FiX size={10} /></button>
            </span>
          )}
          {columnFilters.numeroSerie && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
              N° Série: {columnFilters.numeroSerie}
              <button onClick={() => handleFilterChange('numeroSerie', '')}><FiX size={10} /></button>
            </span>
          )}
          {columnFilters.systeme && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
              Système: {columnFilters.systeme}
              <button onClick={() => handleFilterChange('systeme', '')}><FiX size={10} /></button>
            </span>
          )}
          {columnFilters.numeroSerieEcran && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
              N° Série Écran: {columnFilters.numeroSerieEcran}
              <button onClick={() => handleFilterChange('numeroSerieEcran', '')}><FiX size={10} /></button>
            </span>
          )}
          {columnFilters.beneficiaire && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
              Bénéficiaire: {columnFilters.beneficiaire}
              <button onClick={() => handleFilterChange('beneficiaire', '')}><FiX size={10} /></button>
            </span>
          )}
          {columnFilters.etat && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
              État: {columnFilters.etat}
              <button onClick={() => handleFilterChange('etat', '')}><FiX size={10} /></button>
            </span>
          )}
        </div>
      )}

      {/* Tableau avec filtres par colonne à icônes */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="table-container">
          <table className="materiels-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="exercice" 
                      label="Exercice" 
                      value={columnFilters.exercice}
                      placeholder="Filtrer par exercice..."
                    />
                  </div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="type" 
                      label="Type" 
                      value={columnFilters.type}
                      placeholder="Filtrer par type..."
                    />
                  </div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="marque" 
                      label="Marque" 
                      value={columnFilters.marque}
                      placeholder="Filtrer par marque..."
                    />
                  </div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="numeroInventaire" 
                      label="N° Inventaire" 
                      value={columnFilters.numeroInventaire}
                      placeholder="Filtrer par N° inventaire..."
                    />
                  </div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="numeroSerie" 
                      label="N° Série" 
                      value={columnFilters.numeroSerie}
                      placeholder="Filtrer par N° série..."
                    />
                  </div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="systeme" 
                      label="Système" 
                      value={columnFilters.systeme}
                      placeholder="Filtrer par système..."
                    />
                  </div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="numeroSerieEcran" 
                      label="N° Série Écran" 
                      value={columnFilters.numeroSerieEcran}
                      placeholder="Filtrer par N° série écran..."
                    />
                  </div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="beneficiaire" 
                      label="Bénéficiaire" 
                      value={columnFilters.beneficiaire}
                      placeholder="Filtrer par bénéficiaire..."
                    />
                  </div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="etat" 
                      label="État" 
                      value={columnFilters.etat}
                      placeholder="Filtrer par état..."
                    />
                  </div>
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                      <span className="text-gray-500">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMateriels.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FiInfo size={48} className="text-gray-300 mb-2" />
                      <p className="text-lg font-medium">Aucun matériel trouvé</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMateriels.map(materiel => (
                  <React.Fragment key={materiel.id}>
                    <tr
                      className={`hover:bg-gray-50 cursor-pointer ${expandedRow === materiel.id ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleRow(materiel.id)}
                    >
                      <td className="px-2 py-3 text-sm text-gray-700">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                          {getExercice(materiel)}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-sm font-medium text-gray-900">{getType(materiel)}</td>
                      <td className="px-2 py-3 text-sm text-gray-700">{getMarque(materiel)}</td>
                      <td className="px-2 py-3 text-sm font-medium text-blue-600">{materiel.numeroInventaire || 'N/A'}</td>
                      <td className="px-2 py-3 text-sm text-gray-600">{materiel.numeroSerie || 'N/A'}</td>
                      <td className="px-2 py-3 text-sm text-gray-700">{getSystemeExploitation(materiel)}</td>
                      <td className="px-2 py-3 text-sm text-gray-600">{materiel.numeroSerieEcran || 'N/A'}</td>
                      <td className="px-2 py-3 text-sm text-gray-900">
                        {materiel.beneficiaire ? `${materiel.beneficiaire.nom} ${materiel.beneficiaire.prenom}` : 'Non attribué'}
                      </td>
                      <td className="px-2 py-3">{getStatusBadge(materiel.etat)}</td>
                      <td className="px-2 py-3">
                        <div className="flex space-x-2">
                          {materiel.etat === 'DISPONIBLE' && (
                            <button
                              onClick={(e) => handleAttributionClick(e, materiel)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Attribuer ce matériel"
                            >
                              <FiUserPlus size={16} />
                            </button>
                          )}
                          <button className="text-blue-600 hover:text-blue-900 p-1"><FiEdit size={16} /></button>
                          <button className="text-red-600 hover:text-red-900 p-1"><FiTrash size={16} /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === materiel.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="10" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
                              <span className="font-semibold text-gray-700">Exercice:</span>
                              <div className="mt-1 text-gray-600">{getExercice(materiel)}</div>
                              <span className="font-semibold text-gray-700 mt-2 block">Date acquisition:</span>
                              <div className="mt-1 text-gray-600">
                                {materiel.dateAcquisition ? new Date(materiel.dateAcquisition).toLocaleDateString('fr-FR') : 'N/A'}
                              </div>
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

        {/* Pied du tableau avec réinitialisation */}
        {filteredMateriels.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <span className="text-sm text-gray-700">
              Affichage de <span className="font-semibold">{filteredMateriels.length}</span> matériel(s)
            </span>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* Modal d'attribution */}
      {showAttributionModal && selectedMaterielForAttribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiUserPlus className="text-green-600" />
                Attribuer le matériel
              </h3>
              <button
                onClick={() => setShowAttributionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Matériel à attribuer :</p>
                <p className="font-medium text-gray-800">
                  {getType(selectedMaterielForAttribution)} - {getMarque(selectedMaterielForAttribution)}
                </p>
                <p className="text-xs text-gray-500">
                  N° Inventaire: {selectedMaterielForAttribution.numeroInventaire || 'N/A'} |
                  N° Série: {selectedMaterielForAttribution.numeroSerie || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiUser className="text-purple-500" size={16} />
                  Bénéficiaire
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowBeneficiaireDropdownModal(!showBeneficiaireDropdownModal)}
                    className={`w-full p-3 border rounded-lg text-left flex justify-between items-center ${
                      selectedBeneficiaireForAttribution ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    <span className="truncate">
                      {selectedBeneficiaireForAttribution
                        ? `${selectedBeneficiaireForAttribution.nom} ${selectedBeneficiaireForAttribution.prenom}`
                        : 'Sélectionner un bénéficiaire...'}
                    </span>
                    <FiChevronDown className={`transition-transform ${showBeneficiaireDropdownModal ? 'rotate-180' : ''}`} />
                  </button>

                  {showBeneficiaireDropdownModal && (
                    <div className="absolute z-40 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b sticky top-0 bg-white">
                        <input
                          type="text"
                          value={beneficiaireSearchModal}
                          onChange={(e) => setBeneficiaireSearchModal(e.target.value)}
                          placeholder="Rechercher un bénéficiaire..."
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      {filteredBeneficiairesModal.map(b => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setSelectedBeneficiaireForAttribution(b);
                            setShowBeneficiaireDropdownModal(false);
                            setBeneficiaireSearchModal('');
                          }}
                          className={`px-4 py-2 hover:bg-green-50 cursor-pointer ${
                            selectedBeneficiaireForAttribution?.id === b.id ? 'bg-green-50' : ''
                          }`}
                        >
                          <p className="font-medium">{b.nom} {b.prenom}</p>
                          <p className="text-xs text-gray-500">{b.matricule || 'N° matricule'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiCalendar className="text-purple-500" size={16} />
                  Date d'attribution
                </label>
                <input
                  type="date"
                  value={attributionDate}
                  onChange={(e) => setAttributionDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAttribuer}
                  disabled={attributing || !selectedBeneficiaireForAttribution}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {attributing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Attribution...
                    </>
                  ) : (
                    <>
                      <FiCheck size={18} />
                      Confirmer l'attribution
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAttributionModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterielsTable;