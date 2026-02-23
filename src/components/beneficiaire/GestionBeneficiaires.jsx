import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiHash,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX,
  FiCheck,
  FiRefreshCw,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiDownload,
  FiEye,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import {
  getAllBeneficiaires,
  getBeneficiaireById,
  searchBeneficiaires,
  getBeneficiairesByDepartement,
  createBeneficiaire,
  updateBeneficiaire,
  deleteBeneficiaire
} from '../../services/beneficiareService';

const GestionBeneficiaires = () => {
  // États principaux
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [filteredBeneficiaires, setFilteredBeneficiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  
  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartement, setSelectedDepartement] = useState('');
  const [departements, setDepartements] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    matricule: '',
    departement: '',
    fonction: ''
  });
  
  // État pour les erreurs de validation
  const [errors, setErrors] = useState({});

  // Charger les bénéficiaires au montage
  useEffect(() => {
    loadBeneficiaires();
  }, []);

  // Filtrer les bénéficiaires quand les filtres changent
  useEffect(() => {
    filterBeneficiaires();
  }, [searchTerm, selectedDepartement, beneficiaires]);

  // Extraire les départements uniques
  useEffect(() => {
    const uniqueDepts = [...new Set(beneficiaires.map(b => b.departement).filter(Boolean))];
    setDepartements(uniqueDepts);
  }, [beneficiaires]);

  // Charger tous les bénéficiaires
  const loadBeneficiaires = async () => {
    try {
      setLoading(true);
      const response = await getAllBeneficiaires();
      setBeneficiaires(response.data || []);
      setFilteredBeneficiaires(response.data || []);
      toast.success('Bénéficiaires chargés avec succès');
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement des bénéficiaires');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les bénéficiaires
  const filterBeneficiaires = () => {
    let filtered = [...beneficiaires];
    
    // Filtre par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        (b.nom && b.nom.toLowerCase().includes(searchLower)) ||
        (b.prenom && b.prenom.toLowerCase().includes(searchLower)) ||
        (b.email && b.email.toLowerCase().includes(searchLower)) ||
        (b.matricule && b.matricule.toLowerCase().includes(searchLower)) ||
        (b.fonction && b.fonction.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtre par département
    if (selectedDepartement) {
      filtered = filtered.filter(b => b.departement === selectedDepartement);
    }
    
    setFilteredBeneficiaires(filtered);
  };

  // Recherche avancée
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      filterBeneficiaires();
      return;
    }
    
    try {
      setLoading(true);
      const response = await searchBeneficiaires(searchTerm);
      setFilteredBeneficiaires(response.data || []);
    } catch (error) {
      console.error('Erreur recherche:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer par département (via API)
  const handleDepartementFilter = async (departement) => {
    setSelectedDepartement(departement);
    
    if (!departement) {
      filterBeneficiaires();
      return;
    }
    
    try {
      setLoading(true);
      const response = await getBeneficiairesByDepartement(departement);
      setFilteredBeneficiaires(response.data || []);
    } catch (error) {
      console.error('Erreur filtrage:', error);
      toast.error('Erreur lors du filtrage par département');
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDepartement('');
    setFilteredBeneficiaires(beneficiaires);
  };

  // Ouvrir le modal pour créer
  const handleOpenCreate = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      matricule: '',
      departement: '',
      fonction: ''
    });
    setErrors({});
    setModalMode('create');
    setShowModal(true);
  };

  // Ouvrir le modal pour voir les détails
  const handleOpenView = (beneficiaire) => {
    setSelectedBeneficiaire(beneficiaire);
    setFormData(beneficiaire);
    setModalMode('view');
    setShowModal(true);
  };

  // Ouvrir le modal pour modifier
  const handleOpenEdit = (beneficiaire) => {
    setSelectedBeneficiaire(beneficiaire);
    setFormData(beneficiaire);
    setErrors({});
    setModalMode('edit');
    setShowModal(true);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBeneficiaire(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      matricule: '',
      departement: '',
      fonction: ''
    });
    setErrors({});
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom?.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    if (!formData.prenom?.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (formData.telephone && !/^[0-9+\-\s]{8,}$/.test(formData.telephone)) {
      newErrors.telephone = 'Téléphone invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Créer un bénéficiaire
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const response = await createBeneficiaire(formData);
      toast.success('Bénéficiaire créé avec succès');
      handleCloseModal();
      loadBeneficiaires(); // Recharger la liste
    } catch (error) {
      console.error('Erreur création:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  // Modifier un bénéficiaire
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const response = await updateBeneficiaire(selectedBeneficiaire.id, formData);
      toast.success('Bénéficiaire modifié avec succès');
      handleCloseModal();
      loadBeneficiaires(); // Recharger la liste
    } catch (error) {
      console.error('Erreur modification:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un bénéficiaire
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteBeneficiaire(id);
      toast.success('Bénéficiaire supprimé avec succès');
      loadBeneficiaires(); // Recharger la liste
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Exporter les données
  const exportToCSV = () => {
    const headers = ['ID', 'Matricule', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Département', 'Fonction'];
    const data = filteredBeneficiaires.map(b => [
      b.id,
      b.matricule || '',
      b.nom || '',
      b.prenom || '',
      b.email || '',
      b.telephone || '',
      b.departement || '',
      b.fonction || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'beneficiaires.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export réussi');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-lg mr-4">
              <FiUser className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestion des Bénéficiaires</h1>
              <p className="text-indigo-100 mt-1">
                {filteredBeneficiaires.length} bénéficiaire(s) • {departements.length} département(s)
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center"
          >
            <FiPlus className="mr-2" />
            Nouveau bénéficiaire
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Rechercher par nom, prénom, email, matricule..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                showFilters || selectedDepartement
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiFilter className="mr-2" />
              Filtres
              {selectedDepartement && (
                <span className="ml-2 bg-white text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
            </button>
            
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              disabled={filteredBeneficiaires.length === 0}
            >
              <FiDownload className="mr-2" />
              Export
            </button>
            
            <button
              onClick={loadBeneficiaires}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              disabled={loading}
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Département
                </label>
                <select
                  value={selectedDepartement}
                  onChange={(e) => handleDepartementFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tous les départements</option>
                  {departements.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tableau des bénéficiaires */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matricule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom & Prénom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fonction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mr-3"></div>
                      <span className="text-gray-500">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBeneficiaires.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <FiInfo className="mx-auto text-gray-400 text-4xl mb-3" />
                    <p className="text-gray-500 text-lg">Aucun bénéficiaire trouvé</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm || selectedDepartement 
                        ? 'Essayez de modifier vos filtres' 
                        : 'Cliquez sur "Nouveau bénéficiaire" pour en créer un'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBeneficiaires.map((beneficiaire) => (
                  <tr key={beneficiaire.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiHash className="text-gray-400 mr-2" size={14} />
                        <span className="text-sm font-medium text-gray-900">
                          {beneficiaire.matricule || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 rounded-full p-2 mr-3">
                          <FiUser className="text-indigo-600" size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {beneficiaire.nom} {beneficiaire.prenom}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {beneficiaire.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {beneficiaire.email && (
                          <div className="flex items-center mb-1">
                            <FiMail className="text-gray-400 mr-2" size={12} />
                            {beneficiaire.email}
                          </div>
                        )}
                        {beneficiaire.telephone && (
                          <div className="flex items-center">
                            <FiPhone className="text-gray-400 mr-2" size={12} />
                            {beneficiaire.telephone}
                          </div>
                        )}
                        {!beneficiaire.email && !beneficiaire.telephone && (
                          <span className="text-gray-400">Non renseigné</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiMapPin className="text-gray-400 mr-2" size={14} />
                        <span className="text-sm text-gray-900">
                          {beneficiaire.departement || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiBriefcase className="text-gray-400 mr-2" size={14} />
                        <span className="text-sm text-gray-900">
                          {beneficiaire.fonction || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenView(beneficiaire)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(beneficiaire)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(beneficiaire.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pied du tableau */}
        {filteredBeneficiaires.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Affichage de <span className="font-semibold">{filteredBeneficiaires.length}</span> bénéficiaire(s)
              </span>
              <span className="text-sm text-gray-500">
                Total: {beneficiaires.length} bénéficiaire(s)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal pour création/édition/visualisation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  {modalMode === 'create' && (
                    <>
                      <FiPlus className="mr-2 text-green-600" />
                      Nouveau Bénéficiaire
                    </>
                  )}
                  {modalMode === 'edit' && (
                    <>
                      <FiEdit className="mr-2 text-blue-600" />
                      Modifier le Bénéficiaire
                    </>
                  )}
                  {modalMode === 'view' && (
                    <>
                      <FiEye className="mr-2 text-indigo-600" />
                      Détails du Bénéficiaire
                    </>
                  )}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={modalMode === 'create' ? handleCreate : modalMode === 'edit' ? handleUpdate : undefined}>
              <div className="p-6 space-y-4">
                {/* Matricule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiHash className="mr-2 text-indigo-500" />
                    Matricule
                  </label>
                  <input
                    type="text"
                    name="matricule"
                    value={formData.matricule || ''}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                    }`}
                    placeholder="Ex: EMP001"
                  />
                </div>
                
                {/* Nom et Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiUser className="mr-2 text-indigo-500" />
                      Nom <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.nom ? 'border-red-500' : modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                      placeholder="Dupont"
                    />
                    {errors.nom && (
                      <p className="mt-1 text-xs text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" size={12} />
                        {errors.nom}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiUser className="mr-2 text-indigo-500" />
                      Prénom <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.prenom ? 'border-red-500' : modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                      placeholder="Jean"
                    />
                    {errors.prenom && (
                      <p className="mt-1 text-xs text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" size={12} />
                        {errors.prenom}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Email et Téléphone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiMail className="mr-2 text-indigo-500" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.email ? 'border-red-500' : modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                      placeholder="jean.dupont@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" size={12} />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiPhone className="mr-2 text-indigo-500" />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.telephone ? 'border-red-500' : modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                      placeholder="0123456789"
                    />
                    {errors.telephone && (
                      <p className="mt-1 text-xs text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" size={12} />
                        {errors.telephone}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Département et Fonction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiMapPin className="mr-2 text-indigo-500" />
                      Département
                    </label>
                    <input
                      type="text"
                      name="departement"
                      value={formData.departement || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                      placeholder="Informatique"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiBriefcase className="mr-2 text-indigo-500" />
                      Fonction
                    </label>
                    <input
                      type="text"
                      name="fonction"
                      value={formData.fonction || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                      placeholder="Développeur"
                    />
                  </div>
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {modalMode === 'view' ? 'Fermer' : 'Annuler'}
                </button>
                
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        {modalMode === 'create' ? 'Création...' : 'Modification...'}
                      </>
                    ) : (
                      <>
                        <FiCheck className="mr-2" />
                        {modalMode === 'create' ? 'Créer' : 'Modifier'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionBeneficiaires;