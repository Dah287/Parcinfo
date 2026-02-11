import React, { useState, useEffect } from 'react';
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
  FiMinus
} from 'react-icons/fi';
import { 
  getAllAchats, 
  searchAchats, 
  createAchat,
  updateAchat,
  deleteAchat,
  getPrixByAchat,
  getStats,
  importerPrixExcel,
  ajouterPrixManuellement,
  getNombrePrixByAchat
} from '../../services/achatService';
import { getAllFournisseurs } from '../../services/fournisseurService';

const AchatTableExcel = () => {
  const [achats, setAchats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalAchats: 0, totalMontant: 0 });
  const [expandedRow, setExpandedRow] = useState(null);
  const [prixDetails, setPrixDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showAddPrixModal, setShowAddPrixModal] = useState(false);
  const [selectedAchatId, setSelectedAchatId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAchat, setCurrentAchat] = useState(null);
  const [creationMode, setCreationMode] = useState('withoutPrix'); // 'withPrix' ou 'withoutPrix'
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [nombrePrixParAchat, setNombrePrixParAchat] = useState({});
  const [formData, setFormData] = useState({
    reference: '',
    date: '',
    tauxTva: '20',
    type: '',
    observations: '',
    fournisseurId: '',
    prixList: []
  });
  
  const [prixForm, setPrixForm] = useState({
    designation: '',
    quantite: 1,
    prixUnitaireHT: 0,
    unite: 'U'
  });
  
  const [manualPrixList, setManualPrixList] = useState([]);
  
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loadingFournisseurs, setLoadingFournisseurs] = useState(false);

  // Charger les achats, statistiques et fournisseurs au montage
  useEffect(() => {
    fetchData();
    fetchStats();
    loadFournisseurs();
  }, []);

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
      const data = await getAllFournisseurs();
      setFournisseurs(data);
    } catch (err) {
      console.error('Erreur lors du chargement des fournisseurs:', err);
      alert('Erreur lors du chargement de la liste des fournisseurs.');
    } finally {
      setLoadingFournisseurs(false);
    }
  };

  // Fonction pour charger tous les nombres de prix
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

// Appelez cette fonction après fetchData
useEffect(() => {
  if (achats.length > 0) {
    chargerNombresPrix();
  }
}, [achats]);

// Fonction simple pour obtenir le nombre de prix
const getNombrePrix = (achatId) => {
  return nombrePrixParAchat[achatId] || 0;
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
    setCreationMode('withoutPrix'); // Mode par défaut
    setFormData({
      reference: '',
      date: new Date().toISOString().split('T')[0],
      tauxTva: '20',
      type: 'MARCHE',
      observations: '',
      fournisseurId: '',
      prixList: []
    });
    setPrixForm({
      designation: '',
      quantite: 1,
      prixUnitaireHT: 0,
      unite: 'U'
    });
    setManualPrixList([]);
    setImportFile(null);
    setShowModal(true);
  };

  const openAddPrixModal = (achatId) => {
    setSelectedAchatId(achatId);
    setManualPrixList([]);
    setPrixForm({
      designation: '',
      quantite: 1,
      prixUnitaireHT: 0,
      unite: 'U'
    });
    setImportFile(null);
    setShowAddPrixModal(true);
  };

  const openEditModal = (achat) => {
    setIsEditMode(true);
    setCurrentAchat(achat);
    setCreationMode('withPrix');
    setFormData({
      reference: achat.reference || '',
      date: achat.date ? achat.date.split('T')[0] : '',
      tauxTva: achat.tauxTva?.toString() || '20',
      type: achat.type || 'MARCHE',
      observations: achat.observations || '',
      fournisseurId: achat.fournisseur?.id?.toString() || '',
      prixList: []
    });
    setShowModal(true);
  };

  const addPrixToList = () => {
    const { designation, quantite, prixUnitaireHT, unite } = prixForm;

    if (!designation || !quantite || !prixUnitaireHT) {
      alert('Veuillez remplir tous les champs du prix');
      return;
    }

    const newPrix = {
      numeroPrix: (formData.prixList.length + 1).toString(),
      designation,
      unite: unite || "U",
      quantite: parseInt(quantite),
      prixUnitaireHT: parseFloat(prixUnitaireHT)
    };

    setFormData(prev => ({
      ...prev,
      prixList: [...prev.prixList, newPrix]
    }));

    setPrixForm({
      designation: '',
      quantite: 1,
      prixUnitaireHT: 0,
      unite: 'U'
    });
  };

  const addManualPrix = () => {
    const { designation, quantite, prixUnitaireHT, unite } = prixForm;

    if (!designation || !quantite || !prixUnitaireHT) {
      alert('Veuillez remplir tous les champs du prix');
      return;
    }

    const newPrix = {
      numeroPrix: (manualPrixList.length + 1).toString(),
      designation,
      unite: unite || "U",
      quantite: parseInt(quantite),
      prixUnitaireHT: parseFloat(prixUnitaireHT)
    };

    setManualPrixList(prev => [...prev, newPrix]);

    setPrixForm({
      designation: '',
      quantite: 1,
      prixUnitaireHT: 0,
      unite: 'U'
    });
  };

  const removeManualPrix = (index) => {
    setManualPrixList(prev => prev.filter((_, i) => i !== index));
  };

  const removePrixFromList = (index) => {
    setFormData(prev => ({
      ...prev,
      prixList: prev.prixList.filter((_, i) => i !== index)
    }));
  };

  const calculateMontantTotal = () => {
    return formData.prixList.reduce(
      (total, prix) => total + calculatePrixTotalHT(prix),
      0
    );
  };

  const calculateManualMontantTotal = () => {
    return manualPrixList.reduce(
      (total, prix) => total + calculatePrixTotalHT(prix),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.reference || !formData.fournisseurId) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Si mode création SANS prix, autoriser la création même sans prixList
      if (creationMode === 'withPrix' && formData.prixList.length === 0) {
        alert('Veuillez ajouter au moins un prix en mode "Avec prix"');
        return;
      }

      const achatData = {
        ...formData,
        tauxTva: parseFloat(formData.tauxTva),
        fournisseurId: parseInt(formData.fournisseurId),
        // Si mode sans prix, envoyer un tableau vide
        prixList: creationMode === 'withPrix' ? formData.prixList : []
      };

      if (isEditMode && currentAchat) {
        await updateAchat(currentAchat.id, achatData);
        alert('Achat mis à jour avec succès');
      } else {
        await createAchat(achatData);
        alert(`Achat créé avec succès ${creationMode === 'withPrix' ? 'et les matériels ont été générés automatiquement' : ''}`);
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

  // Numéro aléatoire entre 1 et 99 (ex: 12)
  const numero = Math.floor(Math.random() * 99) + 1;

  return `Marché ${numero}/${year} DK-DPF`;
};



  const handleGenerateReference = () => {
    setFormData(prev => ({
      ...prev,
      reference: generateReference()
    }));
  };

  const handleImportExcel = async () => {
    if (!importFile) {
      alert('Veuillez sélectionner un fichier Excel');
      return;
    }

    if (!selectedAchatId) {
      alert('Erreur: Achat non sélectionné');
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', importFile);

      const result = await importerPrixExcel(selectedAchatId, formData);
      
      if (result.succes) {
        alert(`Importation réussie !\n${result.lignesImportees} lignes importées\n${result.lignesMiseAJour} lignes mises à jour`);
        setShowAddPrixModal(false);
        setImportFile(null);
        // Rafraîchir les détails de l'achat
        fetchData();
      } else {
        alert(`Erreur lors de l'importation: ${result.messageErreur || 'Veuillez vérifier le format du fichier'}`);
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'importation Excel');
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handleAddManualPrix = async () => {
    if (manualPrixList.length === 0) {
      alert('Veuillez ajouter au moins un prix');
      return;
    }

    if (!selectedAchatId) {
      alert('Erreur: Achat non sélectionné');
      return;
    }

    try {
      await ajouterPrixManuellement(selectedAchatId, manualPrixList);
      alert(`${manualPrixList.length} prix ajoutés avec succès. Les matériels ont été générés automatiquement.`);
      setShowAddPrixModal(false);
      setManualPrixList([]);
      // Rafraîchir les détails de l'achat
      fetchData();
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'ajout des prix');
      console.error(err);
    }
  };

  const calculatePrixTotalHT = (prix) => {
    const qte = Number(prix?.quantite ?? 0);
    const pu = Number(prix?.prixUnitaireHT ?? 0);
    return qte * pu;
  };

  const calculateMontantTotalFromAchat = (achat) => {
    if (!achat?.prixList || !Array.isArray(achat.prixList)) return '0.00';
    const total = achat.prixList.reduce(
      (sum, prix) => sum + calculatePrixTotalHT(prix),
      0
    );
    return total.toFixed(2);
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

  const getFournisseurNameById = (id) => {
    if (!id || !Array.isArray(fournisseurs)) {
      return 'Non sélectionné';
    }
    
    const fournisseur = fournisseurs.find(f => f.id === parseInt(id));
    return fournisseur 
      ? `${fournisseur.code} - ${fournisseur.nom}`
      : 'Fournisseur inconnu';
  };

  // Ajouter une colonne pour le nombre de prix
  // const getNombrePrix = (achat) => {
  //   console.log('Calcul du nombre de prix pour l\'achat:', achat);
  //   return achat?.prixList?.length || 0;
  // };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiFileText className="text-blue-500 text-3xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Achats</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalAchats || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiDollarSign className="text-green-500 text-3xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Montant Total HT</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalMontant ? `${parseFloat(stats.totalMontant).toFixed(2)} DH` : '0,00 DH'}
              </p>
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
            <FiGrid className="text-orange-500 text-3xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Achats sans prix</p>
              <p className="text-2xl font-bold text-gray-800">
                {achats.filter(a => !a.prixList || a.prixList.length === 0).length}
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
              Créez des achats avec ou sans prix, puis ajoutez-les plus tard
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

        {/* Barre de recherche */}
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

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant HT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {achats.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                        <FiFileText size={32} className="text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-700">Aucun achat trouvé</p>
                      <p className="text-sm text-gray-500 mt-1">Commencez par créer un nouvel achat</p>
                    </div>
                  </td>
                </tr>
              ) : (
                achats.map(achat => (
                  <React.Fragment key={achat.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-blue-600">{achat.reference || 'N/A'}</div>
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
                        <div className={`text-sm font-medium ${getNombrePrix(achat) === 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {getNombrePrix(achat.id)} prix prix
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${getNombrePrix(achat) === 0 ? 'text-gray-500' : 'text-green-600'}`}>
                          {calculateMontantTotalFromAchat(achat)} DH
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          getNombrePrix(achat) === 0 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getNombrePrix(achat) === 0 ? 'À compléter' : 'Complété'}
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
                            onClick={() => openAddPrixModal(achat.id)}
                            className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                            title="Ajouter/Importer des prix"
                          >
                            <FiPlus size={16} />
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
                        <td colSpan="8" className="px-6 py-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-700 text-lg">Détails de l'achat</h4>
                                <p className="text-sm text-gray-500 mt-1">{achat.observations || 'Aucune observation'}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openAddPrixModal(achat.id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center"
                                >
                                  <FiPlus className="mr-1" /> Ajouter prix
                                </button>
                                <button
                                  onClick={() => setExpandedRow(null)}
                                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  <FiChevronUp className="mr-1" /> Masquer
                                </button>
                              </div>
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
                                  <p className="text-gray-600 font-medium mb-2">Cet achat n'a pas encore de prix</p>
                                  <p className="text-sm text-gray-500 mb-4">
                                    Ajoutez des prix pour générer automatiquement les matériels
                                  </p>
                                  <button
                                    onClick={() => openAddPrixModal(achat.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                                  >
                                    <FiPlus className="mr-2" /> Ajouter des prix
                                  </button>
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

        {/* Pagination */}
        {achats.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center flex-col sm:flex-row">
            <div className="text-sm text-gray-500 mb-2 sm:mb-0">
              Affichage de <span className="font-semibold">{achats.length}</span> achat(s)
            </div>
            <div className="flex gap-2">
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

      {/* Modal Création/Modification d'achat */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
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
                {/* Sélection du mode de création */}
                {!isEditMode && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Mode de création</h4>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCreationMode('withPrix')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${creationMode === 'withPrix' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <FiPlus className={`text-xl ${creationMode === 'withPrix' ? 'text-blue-600' : 'text-gray-500'}`} />
                        </div>
                        <h5 className="font-medium text-center">Avec prix</h5>
                        <p className="text-sm text-gray-600 text-center mt-1">
                          Créer l'achat avec les prix immédiatement
                        </p>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCreationMode('withoutPrix')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${creationMode === 'withoutPrix' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <FiMinus  className={`text-xl ${creationMode === 'withoutPrix' ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <h5 className="font-medium text-center">Sans prix</h5>
                        <p className="text-sm text-gray-600 text-center mt-1">
                          Créer l'achat vide, ajouter les prix plus tard
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Section Informations générales */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <FiFileText className="mr-2" /> Informations générales
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Référence * <span className="text-xs text-gray-500 font-normal">(Unique)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                     onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Marché 12/2025 DK-DPF"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGenerateReference}
                      className="px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                    >
                      Générer
                    </button>
                  </div>
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
                        Fournisseur * <span className="text-xs text-gray-400">(Sélectionnez dans la liste)</span>
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
                                  {fournisseur.code} - {fournisseur.nom}
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

                {/* Section Prix - UNIQUEMENT en mode "withPrix" */}
                {!isEditMode && creationMode === 'withPrix' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <FiDollarSign className="mr-2" /> Prix et Matériel
                    </h4>
                    <p className="text-sm text-green-700 mb-4">
                      📌 Chaque prix ajouté générera automatiquement les matériels correspondants
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Désignation *
                        </label>
                        <input
                          type="text"
                          value={prixForm.designation}
                          onChange={(e) => setPrixForm({ ...prixForm, designation: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ex: PC Portable Dell"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantité *
                        </label>
                        <input
                          type="number"
                          value={prixForm.quantite}
                          onChange={(e) => setPrixForm({ ...prixForm, quantite: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          P.U. HT (DH) *
                        </label>
                        <input
                          type="number"
                          value={prixForm.prixUnitaireHT}
                          onChange={(e) => setPrixForm({ ...prixForm, prixUnitaireHT: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unité
                        </label>
                        <select
                          value={prixForm.unite}
                          onChange={(e) => setPrixForm({ ...prixForm, unite: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="U">Unité (U)</option>
                          <option value="LOT">Lot</option>
                          <option value="M">Mètre</option>
                          <option value="KG">Kilogramme</option>
                          <option value="L">Litre</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addPrixToList}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-4"
                    >
                      <FiPlus className="inline mr-2" /> Ajouter ce prix
                    </button>

                    {/* Liste des prix ajoutés */}
                    {formData.prixList.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-700 mb-2">Prix ajoutés ({formData.prixList.length})</h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {formData.prixList.map((prix, idx) => (
                            <div key={idx} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-800">{prix.designation}</div>
                                <div className="text-sm text-gray-600">
                                  {prix.quantite} {prix.unite || 'U'} × {(prix.prixUnitaireHT ?? 0).toFixed(2)} DH ={' '}
                                  <span className="font-semibold text-green-600">
                                    {calculatePrixTotalHT(prix).toFixed(2)} DH
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removePrixFromList(idx)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Message pour mode sans prix */}
                {!isEditMode && creationMode === 'withoutPrix' && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Achat sans prix
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Vous créez un achat sans prix. Vous pourrez ajouter les prix plus tard via :
                          </p>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Importation Excel</li>
                            <li>Ajout manuel via formulaire</li>
                            <li>Édition de l'achat</li>
                          </ul>
                          <p className="mt-2">
                            Les matériels seront générés automatiquement lorsque vous ajouterez les prix.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Résumé */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Résumé</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Mode:</span>
                      <div className="font-bold text-lg">
                        {creationMode === 'withPrix' ? 'Avec prix' : 'Sans prix'}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Nombre de prix:</span>
                      <div className="font-bold text-lg">{formData.prixList.length}</div>
                    </div>
                    {creationMode === 'withPrix' && (
                      <div className="col-span-2">
                        <span className="text-sm text-gray-600">Montant Total HT:</span>
                        <div className="font-bold text-lg text-green-600">
                          {calculateMontantTotal().toFixed(2)} DH
                        </div>
                      </div>
                    )}
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

      {/* Modal Ajout/Importation de prix */}
      {showAddPrixModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                Ajouter des prix à l'achat
              </h3>
              <button
                onClick={() => setShowAddPrixModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Choix de la méthode */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Méthode d'ajout</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${importFile === null ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                      <div className="flex items-center mb-3">
                        <div className={`p-2 rounded-full ${importFile === null ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          <FiPlus size={20} />
                        </div>
                        <h5 className="font-medium ml-3">Ajout manuel</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Saisissez les prix un par un via le formulaire
                      </p>
                    </div>
                    
                    <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${importFile !== null ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                      <div className="flex items-center mb-3">
                        <div className={`p-2 rounded-full ${importFile !== null ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          <FiUpload size={20} />
                        </div>
                        <h5 className="font-medium ml-3">Importation Excel</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Importez un fichier Excel avec tous les prix
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formulaire d'ajout manuel */}
                {importFile === null && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <FiPlus className="mr-2" /> Ajout manuel de prix
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Désignation *
                        </label>
                        <input
                          type="text"
                          value={prixForm.designation}
                          onChange={(e) => setPrixForm({ ...prixForm, designation: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: PC Portable Dell"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantité *
                        </label>
                        <input
                          type="number"
                          value={prixForm.quantite}
                          onChange={(e) => setPrixForm({ ...prixForm, quantite: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          P.U. HT (DH) *
                        </label>
                        <input
                          type="number"
                          value={prixForm.prixUnitaireHT}
                          onChange={(e) => setPrixForm({ ...prixForm, prixUnitaireHT: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unité
                        </label>
                        <select
                          value={prixForm.unite}
                          onChange={(e) => setPrixForm({ ...prixForm, unite: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="U">Unité (U)</option>
                          <option value="LOT">Lot</option>
                          <option value="M">Mètre</option>
                          <option value="KG">Kilogramme</option>
                          <option value="L">Litre</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addManualPrix}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
                    >
                      <FiPlus className="inline mr-2" /> Ajouter ce prix
                    </button>

                    {/* Liste des prix ajoutés manuellement */}
                    {manualPrixList.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-700 mb-2">Prix à ajouter ({manualPrixList.length})</h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {manualPrixList.map((prix, idx) => (
                            <div key={idx} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-800">{prix.designation}</div>
                                <div className="text-sm text-gray-600">
                                  {prix.quantite} {prix.unite || 'U'} × {(prix.prixUnitaireHT ?? 0).toFixed(2)} DH ={' '}
                                  <span className="font-semibold text-green-600">
                                    {calculatePrixTotalHT(prix).toFixed(2)} DH
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeManualPrix(idx)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Importation Excel */}
                {importFile !== null && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <FiUpload className="mr-2" /> Importation Excel
                    </h4>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fichier Excel (.xlsx)
                      </label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FiUpload className="w-8 h-8 mb-2 text-green-500" />
                            <p className="mb-2 text-sm text-gray-700">
                              <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                            </p>
                            <p className="text-xs text-gray-500">Fichier Excel uniquement (.xlsx)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept=".xlsx,.xls"
                            onChange={(e) => setImportFile(e.target.files[0])}
                          />
                        </label>
                      </div>
                      
                      {importFile && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FiFile className="text-green-500 mr-2" />
                              <span className="font-medium">{importFile.name}</span>
                            </div>
                            <button
                              onClick={() => setImportFile(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiX />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Taille: {(importFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-4">
                      <h5 className="font-medium text-yellow-800 mb-2">Format Excel requis :</h5>
                      <div className="text-sm text-yellow-700 space-y-1">
                        <p>• Colonne A: Numéro Prix</p>
                        <p>• Colonne B: Désignation</p>
                        <p>• Colonne C: Unité</p>
                        <p>• Colonne D: Quantité</p>
                        <p>• Colonne E: Prix unitaire HT</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Résumé */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Résumé</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Méthode:</span>
                      <div className="font-bold text-lg">
                        {importFile === null ? 'Ajout manuel' : 'Importation Excel'}
                      </div>
                    </div>
                    {importFile === null && (
                      <>
                        <div>
                          <span className="text-sm text-gray-600">Prix à ajouter:</span>
                          <div className="font-bold text-lg">{manualPrixList.length}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-gray-600">Montant Total HT:</span>
                          <div className="font-bold text-lg text-green-600">
                            {calculateManualMontantTotal().toFixed(2)} DH
                          </div>
                        </div>
                      </>
                    )}
                    {importFile !== null && (
                      <div>
                        <span className="text-sm text-gray-600">Fichier:</span>
                        <div className="font-medium truncate">
                          {importFile?.name || 'Aucun fichier'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPrixModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                
                {importFile === null ? (
                  <button
                    type="button"
                    onClick={handleAddManualPrix}
                    disabled={manualPrixList.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? (
                      <>
                        <FiLoader className="animate-spin mr-2" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" />
                        Ajouter {manualPrixList.length} prix
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleImportExcel}
                    disabled={!importFile || importing}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? (
                      <>
                        <FiLoader className="animate-spin mr-2" />
                        Importation en cours...
                      </>
                    ) : (
                      <>
                        <FiUpload className="mr-2" />
                        Importer le fichier
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchatTableExcel;