import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSearch, 
  FiRefreshCw, 
  FiEdit, 
  FiTrash,
  FiPlus,
  FiEye,
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiDownload,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiSave,
  FiAlertTriangle,
  FiUsers,
  FiLoader,
  FiUpload,
  FiFile,
  FiGrid,
  FiMinusCircle,
  FiFolder
} from 'react-icons/fi';
import { 
  getAllAchats, 
  searchAchats, 
  createAchat,
  updateAchat,
  deleteAchat,
  getPrixByAchat,
  getStats,
  getNombrePrixByAchat
} from '../../services/achatService';
import { getAllFournisseurs } from '../../services/fournisseurService';

const AchatTableExcel = () => {
  const [achats, setAchats] = useState([]);
  const [filteredAchats, setFilteredAchats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalAchats: 0, totalMontant: 0 });
  const [expandedRow, setExpandedRow] = useState(null);
  const [prixDetails, setPrixDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAchat, setCurrentAchat] = useState(null);
  const [nombrePrixParAchat, setNombrePrixParAchat] = useState({});

  // États pour les filtres par colonne
  const [columnFilters, setColumnFilters] = useState({
    reference: '',
    exercice: '',
    date: '',
    type: '',
    fournisseur: ''
  });

  // État pour gérer l'affichage des champs de filtre par colonne
  const [activeFilterInput, setActiveFilterInput] = useState(null);
  const filterInputRefs = useRef({});

  const [formData, setFormData] = useState({
    reference: '',
    date: '',
    tauxTva: '20',
    type: 'MARCHE',
    observations: '',
    fournisseurId: '',
    exercice: new Date().getFullYear().toString()
  });

  const [fournisseurs, setFournisseurs] = useState([]);
  const [loadingFournisseurs, setLoadingFournisseurs] = useState(false);

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

  // Charger les achats, statistiques et fournisseurs au montage
  useEffect(() => {
    fetchData();
    fetchStats();
    loadFournisseurs();
  }, []);

  useEffect(() => {
    if (achats.length > 0) {
      chargerNombresPrix();
    }
  }, [achats]);

  // Appliquer les filtres chaque fois que les achats ou les filtres changent
  useEffect(() => {
    filterAchats();
  }, [achats, columnFilters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllAchats();
      setAchats(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des achats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const loadFournisseurs = async () => {
    try {
      setLoadingFournisseurs(true);
      const response = await getAllFournisseurs();
      setFournisseurs(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des fournisseurs:', err);
      alert('Erreur lors du chargement de la liste des fournisseurs.');
    } finally {
      setLoadingFournisseurs(false);
    }
  };

  const chargerNombresPrix = async () => {
    const nombres = {};
    for (const achat of achats) {
      try {
        const response = await getNombrePrixByAchat(achat.id);
        nombres[achat.id] = response.data.nombrePrix;
      } catch (err) {
        nombres[achat.id] = 0;
      }
    }
    setNombrePrixParAchat(nombres);
  };

  const getNombrePrix = (achatId) => {
    return nombrePrixParAchat[achatId] || 0;
  };

  // Fonction de filtrage
  const filterAchats = () => {
    let filtered = [...achats];

    if (columnFilters.reference) {
      const val = columnFilters.reference.toLowerCase();
      filtered = filtered.filter(a => (a.reference || '').toLowerCase().includes(val));
    }
    if (columnFilters.exercice) {
      const val = columnFilters.exercice.toLowerCase();
      filtered = filtered.filter(a => (a.exercice?.toString() || '').toLowerCase().includes(val));
    }
    if (columnFilters.date) {
      const val = columnFilters.date.toLowerCase();
      filtered = filtered.filter(a => {
        const dateStr = a.date ? new Date(a.date).toLocaleDateString('fr-FR') : '';
        return dateStr.toLowerCase().includes(val);
      });
    }
    if (columnFilters.type) {
      const val = columnFilters.type.toLowerCase();
      filtered = filtered.filter(a => (a.type || '').toLowerCase().includes(val));
    }
    if (columnFilters.fournisseur) {
      const val = columnFilters.fournisseur.toLowerCase();
      filtered = filtered.filter(a => (a.fournisseur?.nom || '').toLowerCase().includes(val));
    }

    setFilteredAchats(filtered);
  };

  // Gestionnaire de changement des filtres
  const handleFilterChange = (column, value) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setColumnFilters({
      reference: '',
      exercice: '',
      date: '',
      type: '',
      fournisseur: ''
    });
  };

  // Compter les filtres actifs
  const getActiveFiltersCount = () => {
    return Object.values(columnFilters).filter(value => value && value.trim() !== '').length;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (searchTerm.trim() === '') {
        await fetchData();
      } else {
        const response = await searchAchats(searchTerm);
        setAchats(response.data);
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Erreur lors de la recherche');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet achat ?\nCette action supprimera également tous les matériels associés.')) {
      try {
        await deleteAchat(id);
        setAchats(achats.filter(achat => achat.id !== id));
        setExpandedRow(null);
        fetchStats();
        alert('Achat supprimé avec succès');
      } catch (err) {
        alert(err.message || 'Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const handleViewPrix = async (id) => {
    try {
      if (expandedRow === id) {
        setExpandedRow(null);
        return;
      }
      const response = await getPrixByAchat(id);
      setPrixDetails(prev => ({ ...prev, [id]: response.data }));
      setExpandedRow(id);
    } catch (err) {
      alert(err.message || 'Erreur lors du chargement des prix');
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentAchat(null);
    setFormData({
      reference: '',
      date: new Date().toISOString().split('T')[0],
      tauxTva: '20',
      type: 'MARCHE',
      observations: '',
      fournisseurId: '',
      exercice: new Date().getFullYear().toString()
    });
    setShowModal(true);
  };

  const openEditModal = (achat) => {
    setIsEditMode(true);
    setCurrentAchat(achat);
    setFormData({
      reference: achat.reference || '',
      date: achat.date ? achat.date.split('T')[0] : '',
      tauxTva: achat.tauxTva?.toString() || '20',
      type: achat.type || 'MARCHE',
      observations: achat.observations || '',
      fournisseurId: achat.fournisseur?.id?.toString() || '',
      exercice: achat.exercice?.toString() || new Date().getFullYear().toString()
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.reference || !formData.fournisseurId || !formData.exercice) {
        alert('Veuillez remplir tous les champs obligatoires (référence, fournisseur, exercice)');
        return;
      }

      const achatData = {
        ...formData,
        tauxTva: parseFloat(formData.tauxTva),
        fournisseurId: parseInt(formData.fournisseurId),
        exercice: parseInt(formData.exercice)
      };
      if (isEditMode && currentAchat) {
        await updateAchat(currentAchat.id, achatData);
        alert('Achat mis à jour avec succès');
      } else {
        await createAchat(achatData);
        alert('Achat créé avec succès');
      }

      setShowModal(false);
      fetchData();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Une erreur est survenue');
      console.error(err);
    }
  };

  const generateReference = () => {
    const date = new Date();
    const year = date.getFullYear();
    const numero = Math.floor(Math.random() * 99) + 1;
    return `Marché ${numero}/${year} DK-DPF`;
  };

  const handleGenerateReference = () => {
    setFormData(prev => ({
      ...prev,
      reference: generateReference()
    }));
  };

  const calculatePrixTotalHT = (prix) => {
    const qte = Number(prix?.quantite ?? 0);
    const pu = Number(prix?.prixUnitaireHT ?? 0);
    return qte * pu;
  };

  const getTypeBadge = (type) => {
    const badges = {
      'MARCHE': 'bg-blue-100 text-blue-800',
      'BON_COMMANDE': 'bg-green-100 text-green-800',
      'AUTRE': 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badges[type] || 'bg-gray-100 text-gray-800'}`}>
        {type || 'MARCHE'}
      </span>
    );
  };

  const getExerciceOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i);
    }
    return years.sort((a, b) => b - a);
  };

  // Composant ColumnFilter pour les filtres par colonne avec icône
  const ColumnFilter = ({ column, label, value, placeholder }) => {
    const isActive = activeFilterInput === column;
    const hasValue = value && value.trim() !== '';

    return (
      <div className="relative inline-flex items-center gap-1" ref={el => filterInputRefs.current[column] = el}>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
      <div className="flex items-center">
        <FiAlertTriangle className="mr-2" />
        <span>{error}</span>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiFileText className="text-blue-500 text-3xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Achats</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalAchats || 0}</p>
            </div>
          </div>
        </div>



        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCalendar className="text-purple-500 text-3xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Dernier Achat</p>
              <p className="text-2xl font-bold text-gray-800">
                {achats.length > 0
                  ? new Date(Math.max(...achats.map(a => new Date(a.date)))).toLocaleDateString('fr-FR')
                  : 'Aucun'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiMinusCircle className="text-orange-500 text-3xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Achats sans prix</p>
              <p className="text-2xl font-bold text-gray-800">
                {filteredAchats.filter(a => getNombrePrix(a.id) === 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiFolder className="text-indigo-500 text-3xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Exercice courant</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestion des Achats</h2>
            <p className="text-sm text-gray-500 mt-1">
              Créez des achats, puis ajoutez les prix via les composants dédiés
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center transition-colors"
              title="Actualiser la liste"
            >
              <FiRefreshCw className="mr-2" /> Actualiser
            </button>

            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors shadow-md"
            >
              <FiPlus className="mr-2" /> Nouvel Achat
            </button>
          </div>
        </div>

        {/* Barre de recherche globale (optionnelle) */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par référence, fournisseur..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                <FiSearch className="inline mr-1" /> Rechercher
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  fetchData();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 whitespace-nowrap"
              >
                <FiRefreshCw className="inline mr-1" /> Réinitialiser
              </button>
            </div>
          </form>
        </div>

        {/* Indicateur des filtres actifs */}
        {getActiveFiltersCount() > 0 && (
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-blue-700">Filtres actifs ({getActiveFiltersCount()}):</span>
            {columnFilters.reference && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                Référence: {columnFilters.reference}
                <button onClick={() => handleFilterChange('reference', '')} className="hover:text-blue-600"><FiX size={12} /></button>
              </span>
            )}
            {columnFilters.exercice && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                Exercice: {columnFilters.exercice}
                <button onClick={() => handleFilterChange('exercice', '')} className="hover:text-blue-600"><FiX size={12} /></button>
              </span>
            )}
            {columnFilters.date && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                Date: {columnFilters.date}
                <button onClick={() => handleFilterChange('date', '')} className="hover:text-blue-600"><FiX size={12} /></button>
              </span>
            )}
            {columnFilters.type && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                Type: {columnFilters.type}
                <button onClick={() => handleFilterChange('type', '')} className="hover:text-blue-600"><FiX size={12} /></button>
              </span>
            )}
            {columnFilters.fournisseur && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                Fournisseur: {columnFilters.fournisseur}
                <button onClick={() => handleFilterChange('fournisseur', '')} className="hover:text-blue-600"><FiX size={12} /></button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Tout effacer
            </button>
          </div>
        )}

        {/* Tableau avec filtres par colonne à icônes */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="reference" 
                      label="Référence" 
                      value={columnFilters.reference}
                      placeholder="Filtrer par référence..."
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="exercice" 
                      label="Exercice" 
                      value={columnFilters.exercice}
                      placeholder="Filtrer par exercice..."
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="date" 
                      label="Date de réception" 
                      value={columnFilters.date}
                      placeholder="Filtrer par date (JJ/MM/AAAA)..."
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="type" 
                      label="Type" 
                      value={columnFilters.type}
                      placeholder="Filtrer par type..."
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <ColumnFilter 
                      column="fournisseur" 
                      label="Fournisseur" 
                      value={columnFilters.fournisseur}
                      placeholder="Filtrer par fournisseur..."
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nb Prix
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAchats.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                        <FiFileText size={32} className="text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-700">Aucun achat trouvé</p>
                      <p className="text-sm text-gray-500 mt-1">Ajustez vos filtres ou créez un nouvel achat</p>
                    </div>
                   </td>
                 </tr>
              ) : (
                filteredAchats.map(achat => (
                  <React.Fragment key={achat.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-blue-600">{achat.reference || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiFolder className="mr-1 text-indigo-500" size={14} />
                          <span className="text-sm font-medium text-gray-900">
                            {achat.exercice || new Date().getFullYear()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {achat.date ? new Date(achat.date).toLocaleDateString('fr-FR') : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getTypeBadge(achat.type)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700 flex items-center">
                          <FiUsers className="mr-1 text-blue-500" size={14} />
                          {achat.fournisseur?.nom || 'Non spécifié'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getNombrePrix(achat.id) === 0 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getNombrePrix(achat.id)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleViewPrix(achat.id)}
                            className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="Voir détails et prix"
                          >
                            {expandedRow === achat.id ? <FiChevronUp size={16} /> : <FiEye size={16} />}
                          </button>
                          <button
                            onClick={() => openEditModal(achat)}
                            className="p-1.5 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded transition-colors"
                            title="Modifier"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(achat.id)}
                            className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Supprimer"
                          >
                            <FiTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Ligne détaillée avec prix */}
                    {expandedRow === achat.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-700 text-lg">Détails de l'achat</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  Exercice: {achat.exercice || new Date().getFullYear()} - {achat.observations || 'Aucune observation'}
                                </p>
                              </div>
                              <button
                                onClick={() => setExpandedRow(null)}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <FiChevronUp className="mr-1" /> Masquer
                              </button>
                            </div>

                            <div className="border-t pt-4">
                              <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                <FiDollarSign className="mr-2 text-blue-500" /> 
                                Prix associés ({prixDetails[achat.id]?.length || 0})
                              </h5>

                              {prixDetails[achat.id]?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {prixDetails[achat.id].map((prix, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                                      <div className="font-medium text-gray-800">{prix.designation}</div>
                                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                                        <div>Quantité: <span className="font-medium">{prix.quantite}</span></div>
                                        <div>P.U. HT: {(prix.prixUnitaireHT ?? 0).toFixed(2)} DH</div>
                                        <div>
                                          Total HT: {calculatePrixTotalHT(prix).toFixed(2)} DH
                                        </div>
                                        <div>TVA: <span className="font-medium">{achat.tauxTva || 20}%</span></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                                  <FiFileText className="mx-auto text-gray-400 text-4xl mb-3" />
                                  <p className="text-gray-600 font-medium">Cet achat n'a pas encore de prix</p>
                                  <p className="text-sm text-gray-500 mt-2">
                                    Utilisez vos composants dédiés pour ajouter des prix
                                  </p>
                                </div>
                              )}
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

        {/* Pied du tableau avec réinitialisation des filtres */}
        {filteredAchats.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <span className="text-sm text-gray-700">
              Affichage de <span className="font-semibold">{filteredAchats.length}</span> achat(s)
            </span>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Modal Création/Modification d'achat (inchangé) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {isEditMode ? 'Modifier un Achat' : 'Créer un Nouvel Achat'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FiFileText className="mr-2" /> Informations générales
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Référence * <span className="text-xs text-gray-500 font-normal">(Unique)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.reference}
                          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Marché 12/2025 DK-DPF"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleGenerateReference}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium whitespace-nowrap"
                        >
                          Générer
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exercice * <span className="text-xs text-gray-500">(Année)</span>
                      </label>
                      <select
                        value={formData.exercice}
                        onChange={(e) => setFormData({ ...formData, exercice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">-- Sélectionnez l'exercice --</option>
                        {getExerciceOptions().map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="MARCHE">Marché</option>
                        <option value="BON_COMMANDE">Bon de Commande</option>
                        <option value="AUTRE">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taux TVA (%)
                      </label>
                      <input
                        type="number"
                        value={formData.tauxTva}
                        onChange={(e) => setFormData({ ...formData, tauxTva: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fournisseur *
                      </label>
                      <div className="relative">
                        {loadingFournisseurs ? (
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-center">
                            <FiLoader className="animate-spin mr-2" />
                            <span>Chargement des fournisseurs...</span>
                          </div>
                        ) : (
                          <select
                            value={formData.fournisseurId}
                            onChange={(e) => setFormData({ ...formData, fournisseurId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                            required
                          >
                            <option value="">-- Sélectionnez un fournisseur --</option>
                            {Array.isArray(fournisseurs) && fournisseurs.length > 0 ? (
                              fournisseurs.map((fournisseur) => (
                                <option key={fournisseur.id} value={fournisseur.id}>
                                   {fournisseur.nom}
                                  {fournisseur.ville && ` (${fournisseur.ville})`}
                                </option>
                              ))
                            ) : (
                              <option disabled>Aucun fournisseur disponible</option>
                            )}
                          </select>
                        )}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <FiChevronDown />
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observations
                      </label>
                      <textarea
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Notes supplémentaires..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <span className="text-sm text-gray-600">Prochaine étape:</span>
                    <div className="font-medium">
                      Ajouter les prix après création
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FiSave className="mr-2" />
                  {isEditMode ? 'Mettre à jour' : 'Créer l\'achat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchatTableExcel;