// components/admin/GestionUtilisateurs.jsx
import React, { useState, useEffect } from 'react';
import {
  FiUsers, FiUserPlus, FiEdit2, FiTrash2, FiSearch,
  FiCheckCircle, FiXCircle, FiLoader, FiAlertCircle,
  FiShield, FiUser, FiMail, FiPhone, FiHash,
  FiLock, FiEye, FiEyeOff, FiSave, FiX, FiRefreshCw,
  FiPower, FiKey, FiAlertTriangle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword
} from '../../services/authService';

const GestionUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    level: '',
    message: '',
    color: ''
  });
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'USER',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fonction pour évaluer la force du mot de passe
  const evaluatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        level: '',
        message: '',
        color: ''
      });
      return;
    }

    let score = 0;
    let messages = [];

    // Longueur minimale
    if (password.length >= 8) {
      score += 1;
    } else {
      messages.push('Au moins 8 caractères');
    }

    // Présence de chiffres
    if (/\d/.test(password)) {
      score += 1;
    } else {
      messages.push('Au moins un chiffre');
    }

    // Présence de lettres minuscules
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      messages.push('Au moins une lettre minuscule');
    }

    // Présence de lettres majuscules
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      messages.push('Au moins une lettre majuscule');
    }

    // Présence de caractères spéciaux
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      messages.push('Au moins un caractère spécial (!@#$%^&*)');
    }

    let level = '';
    let color = '';
    let message = '';

    if (score <= 2) {
      level = 'Faible';
      color = 'bg-red-500';
      message = 'Mot de passe trop faible. ' + messages.join(', ');
    } else if (score <= 3) {
      level = 'Moyen';
      color = 'bg-yellow-500';
      message = 'Mot de passe moyen. ' + messages.join(', ');
    } else if (score <= 4) {
      level = 'Bon';
      color = 'bg-blue-500';
      message = 'Bon mot de passe';
    } else {
      level = 'Fort';
      color = 'bg-green-500';
      message = 'Mot de passe très sécurisé !';
    }

    setPasswordStrength({
      score,
      level,
      message,
      color,
      missingRequirements: messages.filter(m => !m.includes('Mot de passe'))
    });
  };

  // Surveiller les changements du mot de passe
  useEffect(() => {
    evaluatePasswordStrength(formData.password);
  }, [formData.password]);

  // Charger les utilisateurs
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.matricule?.toLowerCase().includes(search) ||
      user.nom?.toLowerCase().includes(search) ||
      user.prenom?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

  // Validation du formulaire avec vérification de la force du mot de passe
  const validateForm = () => {
    const errors = {};
    
    if (!formData.matricule.trim()) {
      errors.matricule = 'Le matricule est requis';
    } else if (formData.matricule.length < 3) {
      errors.matricule = 'Le matricule doit contenir au moins 3 caractères';
    }
    
    if (!formData.nom.trim()) {
      errors.nom = 'Le nom est requis';
    }
    
    if (!formData.prenom.trim()) {
      errors.prenom = 'Le prénom est requis';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalide';
    }
    
    if (!selectedUser) {
      if (!formData.password) {
        errors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 8) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      } else if (passwordStrength.score < 3) {
        errors.password = `Mot de passe ${passwordStrength.level.toLowerCase()}. ${passwordStrength.message}`;
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Ouvrir modal pour ajouter/modifier
  const openModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        matricule: user.matricule || '',
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        role: user.role || 'USER',
        password: '',
        confirmPassword: ''
      });
    } else {
      setSelectedUser(null);
      setFormData({
        matricule: '',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        role: 'USER',
        password: '',
        confirmPassword: ''
      });
    }
    setPasswordStrength({ score: 0, level: '', message: '', color: '' });
    setFormErrors({});
    setShowModal(true);
  };

  // Ouvrir modal de réinitialisation mot de passe
  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordStrength({ score: 0, level: '', message: '', color: '' });
    setShowPasswordModal(true);
  };

  // Sauvegarder utilisateur
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setFormLoading(true);
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, formData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        await createUser(formData);
        toast.success('Utilisateur créé avec succès');
      }
      setShowModal(false);
      loadUsers();
    } catch (error) {
      console.error('Erreur détaillée:', error);
      console.error('Response:', error.response?.data);
      
      let errorMessage = 'Erreur lors de l\'enregistrement';
      
      if (error.response?.data) {
        const responseData = error.response.data;
        
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.message && typeof responseData.message === 'string') {
          errorMessage = responseData.message;
        } else if (responseData.error && typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        } else if (responseData.errors) {
          const validationErrors = {};
          Object.keys(responseData.errors).forEach(key => {
            validationErrors[key] = responseData.errors[key];
          });
          setFormErrors(validationErrors);
          errorMessage = 'Veuillez corriger les erreurs du formulaire';
        }
      }
      
      toast.error(errorMessage);
      
      if (errorMessage.toLowerCase().includes('matricule')) {
        setFormErrors({ matricule: errorMessage });
      } else if (errorMessage.toLowerCase().includes('email')) {
        setFormErrors({ email: errorMessage });
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Réinitialiser mot de passe avec vérification de force
  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error('Veuillez entrer un nouveau mot de passe');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    // Vérifier la force du mot de passe pour la réinitialisation
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;
    
    if (score < 3) {
      toast.error('Le mot de passe est trop faible. Utilisez au moins 8 caractères avec majuscules, minuscules et chiffres.');
      return;
    }
    
    setFormLoading(true);
    try {
      await resetUserPassword(selectedUser.id, newPassword);
      toast.success('Mot de passe réinitialisé avec succès');
      setShowPasswordModal(false);
    } catch (error) {
      let errorMessage = 'Erreur lors de la réinitialisation';
      if (error.response?.data?.message && typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Supprimer utilisateur
  const handleDelete = async (user) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.matricule} ?`)) {
      try {
        await deleteUser(user.id);
        toast.success('Utilisateur supprimé avec succès');
        loadUsers();
      } catch (error) {
        let errorMessage = 'Erreur lors de la suppression';
        if (error.response?.data?.message && typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        }
        toast.error(errorMessage);
      }
    }
  };

  // Activer/Désactiver utilisateur
  const handleToggleStatus = async (user) => {
    try {
      await toggleUserStatus(user.id, !user.actif);
      toast.success(`Utilisateur ${user.actif ? 'désactivé' : 'activé'} avec succès`);
      loadUsers();
    } catch (error) {
      let errorMessage = 'Erreur lors du changement de statut';
      if (error.response?.data?.message && typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    }
  };

  // Obtenir la couleur du rôle
  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'GESTIONNAIRE': return 'bg-purple-100 text-purple-800';
      case 'TECHNICIEN': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le libellé du rôle
  const getRoleLabel = (role) => {
    switch(role) {
      case 'ADMIN': return 'Administrateur';
      case 'GESTIONNAIRE': return 'Gestionnaire';
      case 'TECHNICIEN': return 'Technicien';
      default: return 'Utilisateur';
    }
  };

  // Obtenir la couleur de la barre de force
  const getStrengthBarColor = () => {
    switch(passwordStrength.level) {
      case 'Faible': return 'bg-red-500';
      case 'Moyen': return 'bg-yellow-500';
      case 'Bon': return 'bg-blue-500';
      case 'Fort': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  // Obtenir la largeur de la barre de force
  const getStrengthBarWidth = () => {
    return `${(passwordStrength.score / 5) * 100}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiUsers className="mr-2 text-indigo-600" />
            Gestion des Utilisateurs
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les comptes utilisateurs du système
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <FiUserPlus className="mr-2" size={18} />
          Nouvel utilisateur
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par matricule, nom, prénom ou email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FiLoader className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Matricule</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Nom complet</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Téléphone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Rôle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm">{user.matricule}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{user.nom} {user.prenom}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">{user.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">{user.telephone || '-'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.actif ? (
                        <><FiCheckCircle className="mr-1" size={12} /> Actif</>
                      ) : (
                        <><FiXCircle className="mr-1" size={12} /> Inactif</>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(user)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => openPasswordModal(user)}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Réinitialiser mot de passe"
                      >
                        <FiKey size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title={user.actif ? 'Désactiver' : 'Activer'}
                      >
                        <FiPower size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FiAlertCircle className="mx-auto text-4xl text-gray-400 mb-2" />
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Ajouter/Modifier Utilisateur */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matricule <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.matricule}
                    onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.matricule ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="USER001"
                  />
                </div>
                {formErrors.matricule && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.matricule}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.nom ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Dupont"
                  />
                  {formErrors.nom && <p className="text-xs text-red-500 mt-1">{formErrors.nom}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.prenom ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Jean"
                  />
                  {formErrors.prenom && <p className="text-xs text-red-500 mt-1">{formErrors.prenom}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="jean.dupont@example.com"
                  />
                </div>
                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0612345678"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="USER">Utilisateur</option>
                  <option value="TECHNICIEN">Technicien</option>
                  <option value="GESTIONNAIRE">Gestionnaire</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
              
              {!selectedUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          formErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    
                    {/* Barre de force du mot de passe */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Force du mot de passe:</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${getStrengthBarColor()}`}>
                            {passwordStrength.level || 'N/A'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor()}`}
                            style={{ width: getStrengthBarWidth() }}
                          />
                        </div>
                        {passwordStrength.message && (
                          <div className="flex items-start gap-1 mt-2">
                            {passwordStrength.score < 3 && (
                              <FiAlertTriangle className="text-yellow-500 text-xs mt-0.5 flex-shrink-0" size={12} />
                            )}
                            <p className={`text-xs ${passwordStrength.score < 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {passwordStrength.message}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                    {formErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{formErrors.confirmPassword}</p>}
                    {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-xs text-green-500 mt-1">✓ Les mots de passe correspondent</p>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={formLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                {formLoading ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />}
                {selectedUser ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Réinitialisation mot de passe avec vérification de force */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Réinitialiser le mot de passe</h3>
              <p className="text-sm text-gray-500 mt-1">
                Utilisateur: {selectedUser?.nom} {selectedUser?.prenom} ({selectedUser?.matricule})
              </p>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    evaluatePasswordStrength(e.target.value);
                  }}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              
              {/* Barre de force du mot de passe pour réinitialisation */}
              {newPassword && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Force du mot de passe:</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${getStrengthBarColor()}`}>
                      {passwordStrength.level || 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor()}`}
                      style={{ width: getStrengthBarWidth() }}
                    />
                  </div>
                  {passwordStrength.message && (
                    <div className="flex items-start gap-1 mt-2">
                      {passwordStrength.score < 3 && (
                        <FiAlertTriangle className="text-yellow-500 text-xs mt-0.5 flex-shrink-0" size={12} />
                      )}
                      <p className={`text-xs ${passwordStrength.score < 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {passwordStrength.message}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 font-medium mb-2">Le mot de passe doit contenir :</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className={newPassword.length >= 8 ? "text-green-600 line-through" : ""}>
                    • Au moins 8 caractères
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? "text-green-600 line-through" : ""}>
                    • Au moins une lettre minuscule
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? "text-green-600 line-through" : ""}>
                    • Au moins une lettre majuscule
                  </li>
                  <li className={/\d/.test(newPassword) ? "text-green-600 line-through" : ""}>
                    • Au moins un chiffre
                  </li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-green-600 line-through" : ""}>
                    • Au moins un caractère spécial (!@#$%^&*)
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleResetPassword}
                disabled={formLoading || (newPassword && passwordStrength.score < 3)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center"
              >
                {formLoading ? <FiLoader className="animate-spin mr-2" /> : <FiKey className="mr-2" />}
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUtilisateurs;