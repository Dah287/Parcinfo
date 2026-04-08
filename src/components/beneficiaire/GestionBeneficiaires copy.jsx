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
  FiInfo,
  FiDownload,
  FiEye,
  FiAlertCircle,
  FiHome,
  FiLayers,
  FiGrid
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import {
  getAllBeneficiaires,
  searchBeneficiaires,
  createBeneficiaire,
  updateBeneficiaire,
  deleteBeneficiaire,
  getBeneficiairesByBureau,
  getBeneficiairesByDepartment,
  getBeneficiairesByService
} from '../../services/beneficiareService';
import { getAllBureaux } from '../../services/bureauService';
import { getAllDepartments } from '../../services/departmentService';
import { getAllServices } from '../../services/serviceService';

const GestionBeneficiaires = () => {
  // États principaux
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [filteredBeneficiaires, setFilteredBeneficiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  
  // États pour les listes déroulantes
  const [bureaux, setBureaux] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  
  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBureau, setSelectedBureau] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    matricule: '',
    fonction: '',
    bureauId: '',
    departmentId: '',
    serviceId: ''
  });
  
  // État pour les erreurs de validation
  const [errors, setErrors] = useState({});

  // Charger les données au montage
  useEffect(() => {
    loadInitialData();
  }, []);

  // Charger les bénéficiaires quand les filtres changent
  useEffect(() => {
    filterBeneficiaires();
  }, [searchTerm, selectedBureau, selectedDepartment, selectedService, beneficiaires]);

  // Charger toutes les données initiales
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [benefRes, burRes, deptRes, servRes] = await Promise.all([
        getAllBeneficiaires(),
        getAllBureaux(),
        getAllDepartments(),
        getAllServices()
      ]);
      
      setBeneficiaires(benefRes.data || []);
      setFilteredBeneficiaires(benefRes.data || []);
      setBureaux(burRes.data || []);
      setDepartments(deptRes.data || []);
      setServices(servRes.data || []);
      
      toast.success('Données chargées avec succès');
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement des données');
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
        (b.fonction && b.fonction.toLowerCase().includes(searchLower)) ||
        (b.bureau?.name?.toLowerCase().includes(searchLower)) ||
        (b.department?.name?.toLowerCase().includes(searchLower)) ||
        (b.service?.name?.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtre par bureau
    if (selectedBureau) {
      filtered = filtered.filter(b => b.bureau?.id === parseInt(selectedBureau));
    }
    
    // Filtre par département
    if (selectedDepartment) {
      filtered = filtered.filter(b => b.department?.id === parseInt(selectedDepartment));
    }
    
    // Filtre par service
    if (selectedService) {
      filtered = filtered.filter(b => b.service?.id === parseInt(selectedService));
    }
    
    setFilteredBeneficiaires(filtered);
  };

  // Recherche avancée via API
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

  // Filtrer par bureau via API
  const handleBureauFilter = async (bureauId) => {
    setSelectedBureau(bureauId);
    
    if (!bureauId) {
      filterBeneficiaires();
      return;
    }
    
    try {
      setLoading(true);
      const response = await getBeneficiairesByBureau(bureauId);
      setFilteredBeneficiaires(response.data || []);
    } catch (error) {
      console.error('Erreur filtrage:', error);
      toast.error('Erreur lors du filtrage par bureau');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer par département via API
  const handleDepartmentFilter = async (departmentId) => {
    setSelectedDepartment(departmentId);
    
    if (!departmentId) {
      filterBeneficiaires();
      return;
    }
    
    try {
      setLoading(true);
      const response = await getBeneficiairesByDepartment(departmentId);
      setFilteredBeneficiaires(response.data || []);
    } catch (error) {
      console.error('Erreur filtrage:', error);
      toast.error('Erreur lors du filtrage par département');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer par service via API
  const handleServiceFilter = async (serviceId) => {
    setSelectedService(serviceId);
    
    if (!serviceId) {
      filterBeneficiaires();
      return;
    }
    
    try {
      setLoading(true);
      const response = await getBeneficiairesByService(serviceId);
      setFilteredBeneficiaires(response.data || []);
    } catch (error) {
      console.error('Erreur filtrage:', error);
      toast.error('Erreur lors du filtrage par service');
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBureau('');
    setSelectedDepartment('');
    setSelectedService('');
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
      fonction: '',
      bureauId: '',
      departmentId: '',
      serviceId: ''
    });
    setErrors({});
    setModalMode('create');
    setShowModal(true);
  };

  // Ouvrir le modal pour voir les détails
  const handleOpenView = (beneficiaire) => {
    setSelectedBeneficiaire(beneficiaire);
    setFormData({
      nom: beneficiaire.nom || '',
      prenom: beneficiaire.prenom || '',
      email: beneficiaire.email || '',
      telephone: beneficiaire.telephone || '',
      matricule: beneficiaire.matricule || '',
      fonction: beneficiaire.fonction || '',
      bureauId: beneficiaire.bureau?.id || '',
      departmentId: beneficiaire.department?.id || '',
      serviceId: beneficiaire.service?.id || ''
    });
    setModalMode('view');
    setShowModal(true);
  };

  // Ouvrir le modal pour modifier
  const handleOpenEdit = (beneficiaire) => {
    setSelectedBeneficiaire(beneficiaire);
    setFormData({
      nom: beneficiaire.nom || '',
      prenom: beneficiaire.prenom || '',
      email: beneficiaire.email || '',
      telephone: beneficiaire.telephone || '',
      matricule: beneficiaire.matricule || '',
      fonction: beneficiaire.fonction || '',
      bureauId: beneficiaire.bureau?.id || '',
      departmentId: beneficiaire.department?.id || '',
      serviceId: beneficiaire.service?.id || ''
    });
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
      fonction: '',
      bureauId: '',
      departmentId: '',
      serviceId: ''
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
    if (!formData.matricule?.trim()) {
      newErrors.matricule = 'Le matricule est requis';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (formData.telephone && !/^[0-9+\-\s]{8,}$/.test(formData.telephone)) {
      newErrors.telephone = 'Téléphone invalide';
    }
    if (!formData.bureauId) {
      newErrors.bureauId = 'Le bureau est requis';
    }
    if (!formData.departmentId) {
      newErrors.departmentId = 'Le département est requis';
    }
    if (!formData.serviceId) {
      newErrors.serviceId = 'Le service est requis';
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
      loadInitialData(); // Recharger les données
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
      loadInitialData(); // Recharger les données
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
      loadInitialData(); // Recharger les données
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Exporter les données
  const exportToCSV = () => {
    const headers = ['ID', 'Matricule', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Bureau', 'Département', 'Service', 'Fonction'];
    const data = filteredBeneficiaires.map(b => [
      b.id,
      b.matricule || '',
      b.nom || '',
      b.prenom || '',
      b.email || '',
      b.telephone || '',
      b.bureau?.name || '',
      b.department?.name || '',
      b.service?.name || '',
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

  // Fonction pour tronquer le texte
  const truncateText = (text, maxLength = 20) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
<div className="w-full p-6">


      {/* Styles CSS pour le tableau avec scroll horizontal */}
      <style jsx>{`
        .table-container {
          overflow-x: auto;
          max-width: 100%;
          border-radius: 0.5rem;
        }
        
        .beneficiaires-table {
          min-width: 1200px; /* Largeur minimale pour éviter que les colonnes ne se chevauchent */
          width: 100%;
          border-collapse: collapse;
        }
        
        .beneficiaires-table th {
          position: sticky;
          top: 0;
          background-color: #f9fafb;
          z-index: 10;
          white-space: nowrap;
        }
        
        .beneficiaires-table td {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .beneficiaires-table td:hover {
          white-space: normal;
          word-wrap: break-word;
          background-color: #f0f9ff;
          cursor: help;
        }
        
        /* Tooltip personnalisé */
        [data-tooltip] {
          position: relative;
          cursor: help;
        }
        
        [data-tooltip]:before {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          display: none;
          z-index: 20;
        }
        
        [data-tooltip]:hover:before {
          display: block;
        }
        
        /* Style pour la scrollbar */
        .table-container::-webkit-scrollbar {
          height: 8px;
        }
        
        .table-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .table-container::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }
        
        .table-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

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
                {filteredBeneficiaires.length} bénéficiaire(s) • {bureaux.length} bureau(x) • {departments.length} département(s) • {services.length} service(s)
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
              placeholder="Rechercher par nom, prénom, email, matricule, bureau, département, service..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                showFilters || selectedBureau || selectedDepartment || selectedService
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiFilter className="mr-2" />
              Filtres
              {(selectedBureau || selectedDepartment || selectedService) && (
                <span className="ml-2 bg-white text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                  {[selectedBureau, selectedDepartment, selectedService].filter(Boolean).length}
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
              onClick={loadInitialData}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiHome className="mr-2 text-indigo-500" />
                  Bureau
                </label>
                <select
                  value={selectedBureau}
                  onChange={(e) => handleBureauFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tous les bureaux</option>
                  {bureaux.map(bureau => (
                    <option key={bureau.id} value={bureau.id}>{bureau.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiLayers className="mr-2 text-indigo-500" />
                  Département
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tous les départements</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiGrid className="mr-2 text-indigo-500" />
                  Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => handleServiceFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tous les services</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tableau des bénéficiaires avec scroll horizontal */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="table-container">
          <table className="beneficiaires-table">
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
                  Bureau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mr-3"></div>
                      <span className="text-gray-500">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBeneficiaires.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <FiInfo className="mx-auto text-gray-400 text-4xl mb-3" />
                    <p className="text-gray-500 text-lg">Aucun bénéficiaire trouvé</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm || selectedBureau || selectedDepartment || selectedService
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
                        <FiHash className="text-gray-400 mr-2 flex-shrink-0" size={14} />
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[100px]" title={beneficiaire.matricule || 'N/A'}>
                          {beneficiaire.matricule || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 rounded-full p-2 mr-3 flex-shrink-0">
                          <FiUser className="text-indigo-600" size={14} />
                        </div>
                        <div className="truncate max-w-[150px]" title={`${beneficiaire.nom || ''} ${beneficiaire.prenom || ''}`}>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {beneficiaire.nom} {beneficiaire.prenom}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {beneficiaire.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-[150px]" title={`${beneficiaire.email || ''} ${beneficiaire.telephone || ''}`}>
                        {beneficiaire.email && (
                          <div className="flex items-center mb-1">
                            <FiMail className="text-gray-400 mr-2 flex-shrink-0" size={12} />
                            <span className="truncate">{beneficiaire.email}</span>
                          </div>
                        )}
                        {beneficiaire.telephone && (
                          <div className="flex items-center">
                            <FiPhone className="text-gray-400 mr-2 flex-shrink-0" size={12} />
                            <span className="truncate">{beneficiaire.telephone}</span>
                          </div>
                        )}
                        {!beneficiaire.email && !beneficiaire.telephone && (
                          <span className="text-gray-400">Non renseigné</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiHome className="text-gray-400 mr-2 flex-shrink-0" size={14} />
                        <span className="text-sm text-gray-900 truncate max-w-[100px]" title={beneficiaire.bureau?.name || 'N/A'}>
                          {beneficiaire.bureau?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiLayers className="text-gray-400 mr-2 flex-shrink-0" size={14} />
                        <span className="text-sm text-gray-900 truncate max-w-[100px]" title={beneficiaire.department?.name || 'N/A'}>
                          {beneficiaire.department?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiGrid className="text-gray-400 mr-2 flex-shrink-0" size={14} />
                        <span className="text-sm text-gray-900 truncate max-w-[100px]" title={beneficiaire.service?.name || 'N/A'}>
                          {beneficiaire.service?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiBriefcase className="text-gray-400 mr-2 flex-shrink-0" size={14} />
                        <span className="text-sm text-gray-900 truncate max-w-[100px]" title={beneficiaire.fonction || 'N/A'}>
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
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
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
                    Matricule <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="matricule"
                    value={formData.matricule || ''}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.matricule ? 'border-red-500' : modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                    }`}
                    placeholder="Ex: EMP001"
                  />
                  {errors.matricule && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" size={12} />
                      {errors.matricule}
                    </p>
                  )}
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
                
                {/* Bureau, Département, Service */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiHome className="mr-2 text-indigo-500" />
                      Bureau <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="bureauId"
                      value={formData.bureauId || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.bureauId ? 'border-red-500' : modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Sélectionner un bureau</option>
                      {bureaux.map(bureau => (
                        <option key={bureau.id} value={bureau.id}>{bureau.name}</option>
                      ))}
                    </select>
                    {errors.bureauId && (
                      <p className="mt-1 text-xs text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" size={12} />
                        {errors.bureauId}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiLayers className="mr-2 text-indigo-500" />
                      Département <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="departmentId"
                      value={formData.departmentId || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.departmentId ? 'border-red-500' : modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Sélectionner un département</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    {errors.departmentId && (
                      <p className="mt-1 text-xs text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" size={12} />
                        {errors.departmentId}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiGrid className="mr-2 text-indigo-500" />
                      Service <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="serviceId"
                      value={formData.serviceId || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.serviceId ? 'border-red-500' : modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Sélectionner un service</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))}
                    </select>
                    {errors.serviceId && (
                      <p className="mt-1 text-xs text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" size={12} />
                        {errors.serviceId}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Fonction */}
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
              
              {/* Boutons d'action */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                <div className="flex justify-end space-x-3">
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionBeneficiaires;