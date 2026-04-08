import React, { useState, useEffect } from 'react';
import {
  FiTruck,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiX,
  FiCheck,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiBriefcase,
  FiFilter,
  FiDownload,
  FiEye,
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { 
deleteFournisseur,
getAllFournisseurs,
getFournisseurById,
createFournisseur,
updateFournisseur
} from '../../services/fournisseurService';

const GestionFournisseurs = () => {
  // États pour la liste et la recherche
  const [fournisseurs, setFournisseurs] = useState([]);
  const [filteredFournisseurs, setFilteredFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nom', direction: 'asc' });

  // États pour le modal de création/modification
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentFournisseur, setCurrentFournisseur] = useState({
    code: '',
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    contactPrincipal: ''
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // États pour la confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fournisseurToDelete, setFournisseurToDelete] = useState(null);

  // États pour la vue détaillée
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);

  // Charger les fournisseurs
  useEffect(() => {
    loadFournisseurs();
  }, []);

  // Filtrer les fournisseurs lorsque searchTerm change
  useEffect(() => {
    if (Array.isArray(fournisseurs)) {
      const filtered = fournisseurs.filter(fournisseur =>
        Object.values(fournisseur).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredFournisseurs(filtered);
    }
  }, [searchTerm, fournisseurs]);

  const loadFournisseurs = async () => {
    try {
      setLoading(true);
      const response = await getAllFournisseurs();
      // CORRECTION: Extraire response.data ou response selon la structure
      const data = response?.data || response || [];
      console.log('Fournisseurs chargés:', data);
      
      // S'assurer que c'est un tableau
      const fournisseursArray = Array.isArray(data) ? data : [];
      setFournisseurs(fournisseursArray);
      setFilteredFournisseurs(fournisseursArray);
      
      // Réinitialiser les messages d'erreur si succès
      setValidationErrors({});
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
      toast.error('Erreur lors du chargement des fournisseurs');
      setFournisseurs([]);
      setFilteredFournisseurs([]);
    } finally {
      setLoading(false);
    }
  };

  // Gestion du tri
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredFournisseurs].sort((a, b) => {
      const valA = a[key] || '';
      const valB = b[key] || '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredFournisseurs(sorted);
  };

  // Ouvrir le modal de création
  const handleCreate = () => {
    setCurrentFournisseur({
      code: '',
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      contactPrincipal: ''
    });
    setValidationErrors({});
    setModalMode('create');
    setShowModal(true);
  };

  // Ouvrir le modal d'édition
  const handleEdit = (fournisseur) => {
    setCurrentFournisseur({ ...fournisseur });
    setValidationErrors({});
    setModalMode('edit');
    setShowModal(true);
  };

  // Ouvrir la vue détaillée
  const handleViewDetails = (fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setShowDetailModal(true);
  };

  // Ouvrir le modal de confirmation de suppression
  const handleDeleteClick = (fournisseur) => {
    setFournisseurToDelete(fournisseur);
    setShowDeleteModal(true);
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!currentFournisseur.nom?.trim()) {
      errors.nom = 'Le nom du fournisseur est obligatoire';
    }
    
    if (!currentFournisseur.code?.trim()) {
      errors.code = 'Le code du fournisseur est obligatoire';
    } else if (currentFournisseur.code.length < 4) {
      errors.code = 'Le code doit contenir au moins 4 caractères';
    }
    
    if (currentFournisseur.email && !/\S+@\S+\.\S+/.test(currentFournisseur.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (currentFournisseur.telephone && !/^[0-9\+\-\s]+$/.test(currentFournisseur.telephone)) {
      errors.telephone = 'Format de téléphone invalide';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre le formulaire (création ou modification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      setModalLoading(true);
      
      if (modalMode === 'create') {
        console.log('Création fournisseur avec données:', currentFournisseur);
        const response = await createFournisseur(currentFournisseur);
        // CORRECTION: Extraire les données de la réponse
        const newFournisseur = response?.data || response;
        console.log('Fournisseur créé:', newFournisseur);
        
        if (newFournisseur) {
          // CORRECTION: Mettre à jour l'état immédiatement
          setFournisseurs(prev => {
            const updated = [...prev, newFournisseur];
            return updated;
          });
          toast.success('Fournisseur créé avec succès');
          setShowModal(false);
          
          // Réinitialiser le formulaire
          setCurrentFournisseur({
            code: '',
            nom: '',
            adresse: '',
            telephone: '',
            email: '',
            contactPrincipal: ''
          });
        }
      } else {
        console.log('Modification fournisseur ID:', currentFournisseur.id, 'Données:', currentFournisseur);
        const response = await updateFournisseur(
          currentFournisseur.id,
          currentFournisseur
        );
        // CORRECTION: Extraire les données de la réponse
        const updatedFournisseur = response?.data || response;
        console.log('Fournisseur modifié:', updatedFournisseur);
        
        if (updatedFournisseur) {
          // CORRECTION: Mettre à jour l'état immédiatement
          setFournisseurs(prev =>
            prev.map(f => f.id === updatedFournisseur.id ? updatedFournisseur : f)
          );
          toast.success('Fournisseur modifié avec succès');
          setShowModal(false);
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fournisseur:', error);
      
      // Gestion des erreurs spécifiques
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('code')) {
          toast.error('Un fournisseur avec ce code existe déjà');
          setValidationErrors(prev => ({
            ...prev,
            code: 'Ce code est déjà utilisé'
          }));
        } else {
          toast.error('Données invalides');
        }
      } else if (error.response?.status === 409) {
        toast.error('Conflit: Le fournisseur existe déjà');
      } else {
        toast.error('Erreur lors de la sauvegarde du fournisseur');
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Confirmer la suppression
  const confirmDelete = async () => {
    if (!fournisseurToDelete) return;

    try {
      await deleteFournisseur(fournisseurToDelete.id);
      // CORRECTION: Mettre à jour l'état immédiatement
      setFournisseurs(prev => prev.filter(f => f.id !== fournisseurToDelete.id));
      toast.success('Fournisseur supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur:', error);
      toast.error('Erreur lors de la suppression du fournisseur');
    } finally {
      setShowDeleteModal(false);
      setFournisseurToDelete(null);
    }
  };

  // Générer un code automatique
  const generateCode = () => {
    const prefix = 'FRN';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `${prefix}-${randomNum}`;
    
    setCurrentFournisseur(prev => ({
      ...prev,
      code: newCode
    }));
    
    // Effacer l'erreur de code si elle existe
    if (validationErrors.code) {
      setValidationErrors(prev => ({
        ...prev,
        code: undefined
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <FiTruck className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Gestion des Fournisseurs</h2>
              <p className="text-gray-600">Gérez vos fournisseurs de matériel informatique</p>
            </div>
          </div>
          
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FiPlus className="mr-2" />
            Nouveau Fournisseur
          </button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un fournisseur par nom, code, téléphone, email..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadFournisseurs}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <FiRefreshCw className="mr-2" />
              Actualiser
            </button>
            
            <div className="text-sm text-gray-500">
              {filteredFournisseurs.length} fournisseur(s)
            </div>
          </div>
        </div>

        {/* Tableau des fournisseurs */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Chargement des fournisseurs...</p>
            </div>
          ) : filteredFournisseurs.length === 0 ? (
            <div className="p-8 text-center">
              <FiTruck className="text-gray-300 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {searchTerm ? 'Aucun fournisseur trouvé' : 'Aucun fournisseur'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Aucun fournisseur ne correspond à votre recherche'
                  : 'Commencez par ajouter votre premier fournisseur'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                  <FiPlus className="mr-2" />
                  Ajouter un fournisseur
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center">
                      Code
                      {sortConfig.key === 'code' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('nom')}
                  >
                    <div className="flex items-center">
                      Nom
                      {sortConfig.key === 'nom' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordonnées
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFournisseurs.map((fournisseur) => (
                  <tr key={fournisseur.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {fournisseur.code?.charAt(0) || 'F'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {fournisseur.code || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {fournisseur.nom || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {fournisseur.contactPrincipal || 'Pas de contact'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <FiPhone className="mr-2 text-gray-400" size={14} />
                          {fournisseur.telephone || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <FiMail className="mr-2 text-gray-400" size={14} />
                          {fournisseur.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        <div className="flex items-center">
                          <FiMapPin className="mr-2 text-gray-400" size={14} />
                          {fournisseur.adresse || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(fournisseur)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Voir détails"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(fournisseur)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Modifier"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(fournisseur)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Supprimer"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Statistiques - Mise à jour immédiate grâce à l'état */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FiTruck className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Fournisseurs</p>
              <p className="text-2xl font-bold text-gray-800">{fournisseurs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <FiPhone className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avec téléphone</p>
              <p className="text-2xl font-bold text-gray-800">
                {fournisseurs.filter(f => f.telephone).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <FiMail className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avec email</p>
              <p className="text-2xl font-bold text-gray-800">
                {fournisseurs.filter(f => f.email).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <FiMapPin className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avec adresse</p>
              <p className="text-2xl font-bold text-gray-800">
                {fournisseurs.filter(f => f.adresse).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de création/modification - AVEC VALIDATION AMÉLIORÉE */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {modalMode === 'create' ? 'Nouveau Fournisseur' : 'Modifier Fournisseur'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={modalLoading}
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
{/* Code */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Code du fournisseur *
  </label>
  <div className="flex space-x-2">
    <div className="flex-1">
      <input
        type="text"
        value={currentFournisseur.code}
        onChange={(e) => {
          setCurrentFournisseur({
            ...currentFournisseur,
            code: e.target.value
          });
          if (validationErrors.code) {
            setValidationErrors({
              ...validationErrors,
              code: undefined
            });
          }
        }}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text ${
          validationErrors.code ? 'border-red-500' : 'border-gray-300'
        } disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
        placeholder="Ex: FRN-001"
        required
        disabled
      />
      {validationErrors.code && (
        <p className="mt-1 text-xs text-red-600">{validationErrors.code}</p>
      )}
    </div>
    <button
      type="button"
      onClick={generateCode}
      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={modalLoading}
    >
      Générer
    </button>
  </div>
</div>

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du fournisseur *
                    </label>
                    <input
                      type="text"
                      value={currentFournisseur.nom}
                      onChange={(e) => {
                        setCurrentFournisseur({
                          ...currentFournisseur,
                          nom: e.target.value
                        });
                        if (validationErrors.nom) {
                          setValidationErrors({
                            ...validationErrors,
                            nom: undefined
                          });
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.nom ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Dell Technologies"
                      required
                      disabled={modalLoading}
                    />
                    {validationErrors.nom && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.nom}</p>
                    )}
                  </div>

                  {/* Contact principal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact principal
                    </label>
                    <input
                      type="text"
                      value={currentFournisseur.contactPrincipal}
                      onChange={(e) => setCurrentFournisseur({
                        ...currentFournisseur,
                        contactPrincipal: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Jean Dupont"
                      disabled={modalLoading}
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={currentFournisseur.telephone}
                      onChange={(e) => {
                        setCurrentFournisseur({
                          ...currentFournisseur,
                          telephone: e.target.value
                        });
                        if (validationErrors.telephone) {
                          setValidationErrors({
                            ...validationErrors,
                            telephone: undefined
                          });
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.telephone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: +212 6 12 34 56 78"
                      disabled={modalLoading}
                    />
                    {validationErrors.telephone && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.telephone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={currentFournisseur.email}
                      onChange={(e) => {
                        setCurrentFournisseur({
                          ...currentFournisseur,
                          email: e.target.value
                        });
                        if (validationErrors.email) {
                          setValidationErrors({
                            ...validationErrors,
                            email: undefined
                          });
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: contact@fournisseur.com"
                      disabled={modalLoading}
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                    )}
                  </div>

                  {/* Adresse */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <textarea
                      value={currentFournisseur.adresse}
                      onChange={(e) => setCurrentFournisseur({
                        ...currentFournisseur,
                        adresse: e.target.value
                      })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Adresse complète..."
                      disabled={modalLoading}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={modalLoading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                    disabled={modalLoading || Object.keys(validationErrors).length > 0}
                  >
                    {modalLoading ? (
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
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <FiAlertCircle className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Confirmer la suppression</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer le fournisseur <strong>{fournisseurToDelete?.nom}</strong> ({fournisseurToDelete?.code}) ? Cette action est irréversible.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setFournisseurToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <FiTrash2 className="mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vue détaillée */}
      {showDetailModal && selectedFournisseur && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <FiTruck className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Détails du Fournisseur</h3>
                    <p className="text-sm text-gray-500">Code: {selectedFournisseur.code}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations principales */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FiBriefcase className="mr-2" />
                    Informations Générales
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nom</p>
                        <p className="font-medium text-gray-800">{selectedFournisseur.nom}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Code</p>
                        <p className="font-medium text-gray-800">{selectedFournisseur.code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Contact Principal</p>
                        <p className="font-medium text-gray-800">
                          {selectedFournisseur.contactPrincipal || 'Non spécifié'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordonnées */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FiMapPin className="mr-2" />
                    Coordonnées
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center">
                      <FiPhone className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="font-medium text-gray-800">
                          {selectedFournisseur.telephone || 'Non spécifié'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiMail className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">
                          {selectedFournisseur.email || 'Non spécifié'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FiMapPin className="text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Adresse</p>
                        <p className="font-medium text-gray-800">
                          {selectedFournisseur.adresse || 'Non spécifiée'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedFournisseur);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <FiEdit className="mr-2" />
                  Modifier
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionFournisseurs;