import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiPackage, 
  FiCheck, 
  FiSearch, 
  FiX, 
  FiInfo, 
  FiChevronDown,
  FiRefreshCw,
  FiArrowRight,
  FiList,
  FiClock,
  FiShield
} from 'react-icons/fi';
import { 
  getMaterielsByBeneficiaire
} from '../../services/materialService';
import { getAllBeneficiaires } from '../../services/beneficiareService';
import { getCurrentUser, getAllUtilisateurs } from '../../services/authService';
import { creerDemandeReaffectation, getDemandesEnAttente ,creerDemandeReaffectationGroupee} from '../../services/reaffectationValidationService';
import { toast } from 'react-toastify';

const MultiReaffectation = () => {
  // États pour les bénéficiaires
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [sourceBeneficiaire, setSourceBeneficiaire] = useState(null);
  const [destinationBeneficiaire, setDestinationBeneficiaire] = useState(null);
  
  // États pour les matériels
  const [materielsSource, setMaterielsSource] = useState([]);
  const [materielsSelectionnes, setMaterielsSelectionnes] = useState([]);
  
  // États pour les dropdowns
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  
  // États de chargement
  const [loadingBeneficiaires, setLoadingBeneficiaires] = useState(true);
  const [loadingMateriels, setLoadingMateriels] = useState(false);
  const [loadingReaffectation, setLoadingReaffectation] = useState(false);
  
  // Date et observations
  const [dateReaffectation, setDateReaffectation] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');

  // États pour la validation à deux niveaux
  const [currentUser, setCurrentUser] = useState(null);
  const [validateurRequis, setValidateurRequis] = useState(null);
  const [demandesEnAttenteCount, setDemandesEnAttenteCount] = useState(0);

  // Charger les bénéficiaires et l'utilisateur connecté
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingBeneficiaires(true);
        
        // Charger les bénéficiaires
        const benefResponse = await getAllBeneficiaires();
        setBeneficiaires(benefResponse.data || []);
        
        // Charger l'utilisateur connecté
        const user = getCurrentUser();
        setCurrentUser(user);
        
        // Charger tous les utilisateurs pour la validation
        if (user) {
          const usersResponse = await getAllUtilisateurs();
          const utilisateursList = usersResponse.data || [];
          
          // Déterminer le validateur requis
          const validateur = getValidateurRequis(user.role, utilisateursList);
          setValidateurRequis(validateur);
          
          // Charger le nombre de demandes en attente pour afficher une notification
          if (user.id) {
            const demandes = await getDemandesEnAttente(user.id);
            setDemandesEnAttenteCount(demandes.length);
          }
        }
      } catch (error) {
        console.error('Erreur chargement données initiales:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoadingBeneficiaires(false);
      }
    };

    loadInitialData();
  }, []);

  // Déterminer le validateur requis en fonction du rôle
  const getValidateurRequis = (userRole, usersList) => {
    if (userRole === 'ADMIN') {
      // ADMIN a besoin d'un USER pour valider
      return usersList.find(u => u.role === 'USER' && u.actif === true);
    } else if (userRole === 'USER') {
      // USER a besoin d'un ADMIN pour valider
      return usersList.find(u => u.role === 'ADMIN' && u.actif === true);
    }
    return null;
  };

  // Charger les matériels du bénéficiaire source quand il est sélectionné
  useEffect(() => {
    const loadMaterielsSource = async () => {
      if (!sourceBeneficiaire) {
        setMaterielsSource([]);
        return;
      }

      try {
        setLoadingMateriels(true);
        const response = await getMaterielsByBeneficiaire(sourceBeneficiaire.id);
        setMaterielsSource(response.data || []);
        setMaterielsSelectionnes([]);
      } catch (error) {
        console.error('Erreur chargement matériels:', error);
        toast.error('Erreur lors du chargement des matériels du bénéficiaire');
      } finally {
        setLoadingMateriels(false);
      }
    };

    loadMaterielsSource();
  }, [sourceBeneficiaire]);

  // Filtrer les bénéficiaires
  const filteredSourceBeneficiaires = beneficiaires.filter(beneficiaire => {
    const searchLower = sourceSearch.toLowerCase();
    return (
      (beneficiaire.nom && beneficiaire.nom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.prenom && beneficiaire.prenom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.matricule && beneficiaire.matricule.toLowerCase().includes(searchLower)) ||
      (beneficiaire.email && beneficiaire.email.toLowerCase().includes(searchLower))
    );
  });

  const filteredDestinationBeneficiaires = beneficiaires.filter(beneficiaire => {
    if (sourceBeneficiaire && beneficiaire.id === sourceBeneficiaire.id) return false;
    
    const searchLower = destinationSearch.toLowerCase();
    return (
      (beneficiaire.nom && beneficiaire.nom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.prenom && beneficiaire.prenom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.matricule && beneficiaire.matricule.toLowerCase().includes(searchLower)) ||
      (beneficiaire.email && beneficiaire.email.toLowerCase().includes(searchLower))
    );
  });

  // Gérer la sélection/désélection des matériels
  const toggleMaterielSelection = (materiel) => {
    setMaterielsSelectionnes(prev => {
      const isSelected = prev.some(m => m.id === materiel.id);
      if (isSelected) {
        return prev.filter(m => m.id !== materiel.id);
      } else {
        return [...prev, materiel];
      }
    });
  };

  const selectAllMateriels = () => {
    setMaterielsSelectionnes([...materielsSource]);
  };

  const deselectAllMateriels = () => {
    setMaterielsSelectionnes([]);
  };

  // Soumettre la réaffectation avec validation à deux niveaux
// MultiReaffectation.jsx - Modifier handleSubmitWithValidation

const handleSubmitWithValidation = async (e) => {
    e.preventDefault();
    
    if (!sourceBeneficiaire || !destinationBeneficiaire) {
        toast.warning('Veuillez sélectionner les bénéficiaires source et destination');
        return;
    }

    if (materielsSelectionnes.length === 0) {
        toast.warning('Veuillez sélectionner au moins un matériel à transférer');
        return;
    }

    if (sourceBeneficiaire.id === destinationBeneficiaire.id) {
        toast.warning('Le bénéficiaire source et destination doivent être différents');
        return;
    }

    if (!currentUser) {
        toast.error('Utilisateur non identifié');
        return;
    }

    if (!validateurRequis) {
        toast.error(`Aucun ${currentUser.role === 'ADMIN' ? 'USER' : 'ADMIN'} disponible pour valider cette opération`);
        return;
    }

    try {
        setLoadingReaffectation(true);
        
        // ✅ Créer UNE SEULE demande groupée
        const materielIds = materielsSelectionnes.map(m => m.id);
        
        const demande = await creerDemandeReaffectationGroupee(
            materielIds,
            destinationBeneficiaire.id,
            currentUser.id,
            validateurRequis.id,
            dateReaffectation,
            observations
        );
        
        toast.success(`Demande groupée créée avec succès ! (${materielsSelectionnes.length} matériel(s))`);
        toast.info(`En attente de validation par ${validateurRequis.nom} ${validateurRequis.prenom} (${validateurRequis.role})`);
        
        // Réinitialiser le formulaire
        resetForm();
        
        // Recharger les matériels du bénéficiaire source
        if (sourceBeneficiaire) {
            const response = await getMaterielsByBeneficiaire(sourceBeneficiaire.id);
            setMaterielsSource(response.data || []);
        }
        
    } catch (error) {
        console.error('Erreur création demande:', error);
        toast.error(error.response?.data?.message || 'Erreur lors de la création de la demande');
    } finally {
        setLoadingReaffectation(false);
    }
};

  const resetForm = () => {
    setSourceBeneficiaire(null);
    setDestinationBeneficiaire(null);
    setMaterielsSelectionnes([]);
    setDateReaffectation(new Date().toISOString().split('T')[0]);
    setObservations('');
    setSourceSearch('');
    setDestinationSearch('');
    setShowSourceDropdown(false);
    setShowDestinationDropdown(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Notification des demandes en attente - lien vers la page de gestion */}
      {demandesEnAttenteCount > 0 && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiClock className="text-orange-600 mr-3" size={20} />
              <div>
                <p className="font-medium text-orange-800">
                  Vous avez {demandesEnAttenteCount} demande(s) en attente de validation
                </p>
                <p className="text-sm text-orange-600">
                  Des demandes de réaffectation nécessitent votre validation
                </p>
              </div>
            </div>
            <a
              href="/demandes-reaffectation"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              Voir les demandes
            </a>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-purple-100 p-3 rounded-lg mr-4">
            <FiRefreshCw className="text-purple-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Transfert Multi-Matériels</h2>
            <p className="text-gray-600">Transférer un ou plusieurs matériels d'un bénéficiaire à un autre</p>
          </div>
        </div>

        <form onSubmit={handleSubmitWithValidation}>
          {/* Section 1: Bénéficiaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Bénéficiaire Source */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-red-100 text-red-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
                Bénéficiaire Source
              </h3>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowSourceDropdown(!showSourceDropdown);
                    setShowDestinationDropdown(false);
                  }}
                  className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                    sourceBeneficiaire 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <FiUser className="mr-3 text-red-500" />
                    <div>
                      {sourceBeneficiaire ? (
                        <>
                          <div className="font-medium text-gray-800">
                            {sourceBeneficiaire.nom} {sourceBeneficiaire.prenom}
                          </div>
                          <div className="text-sm text-gray-600">
                            {sourceBeneficiaire.matricule ? `${sourceBeneficiaire.matricule} • ` : ''}
                            {sourceBeneficiaire.departement?.nom || sourceBeneficiaire.service?.nom || ' '}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">Sélectionner le bénéficiaire source</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {sourceBeneficiaire && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSourceBeneficiaire(null);
                          setMaterielsSource([]);
                          setMaterielsSelectionnes([]);
                          setSourceSearch('');
                        }}
                        className="mr-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={18} />
                      </button>
                    )}
                    <FiChevronDown className={`transition-transform ${showSourceDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showSourceDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <input
                          type="text"
                          value={sourceSearch}
                          onChange={(e) => setSourceSearch(e.target.value)}
                          placeholder="Rechercher un bénéficiaire..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {loadingBeneficiaires ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Chargement...</p>
                        </div>
                      ) : filteredSourceBeneficiaires.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Aucun bénéficiaire trouvé
                        </div>
                      ) : (
                        filteredSourceBeneficiaires.map(beneficiaire => (
                          <div
                            key={beneficiaire.id}
                            onClick={() => {
                              setSourceBeneficiaire(beneficiaire);
                              setShowSourceDropdown(false);
                              setSourceSearch('');
                            }}
                            className={`px-4 py-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              sourceBeneficiaire?.id === beneficiaire.id ? 'bg-red-50' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-800">
                              {beneficiaire.nom} {beneficiaire.prenom}
                            </div>
                            <div className="text-sm text-gray-600 flex justify-between mt-1">
                              <span>{beneficiaire.matricule || 'Sans matricule'}</span>
                              <span>{beneficiaire.departement?.nom || 'Aucun Département'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {sourceBeneficiaire && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <FiInfo className="text-red-500 mr-2" />
                    <div className="text-sm text-red-700">
                      Matériels attribués: {materielsSource.length}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bénéficiaire Destination */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
                Bénéficiaire Destination
              </h3>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowDestinationDropdown(!showDestinationDropdown);
                    setShowSourceDropdown(false);
                  }}
                  className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                    destinationBeneficiaire 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <FiUser className="mr-3 text-green-500" />
                    <div>
                      {destinationBeneficiaire ? (
                        <>
                          <div className="font-medium text-gray-800">
                            {destinationBeneficiaire.nom} {destinationBeneficiaire.prenom}
                          </div>
                          <div className="text-sm text-gray-600">
                            {destinationBeneficiaire.matricule ? `${destinationBeneficiaire.matricule} • ` : ''}
                            {destinationBeneficiaire.departement?.nom || destinationBeneficiaire.service?.nom || ' '}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">Sélectionner le bénéficiaire destination</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {destinationBeneficiaire && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDestinationBeneficiaire(null);
                          setDestinationSearch('');
                        }}
                        className="mr-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={18} />
                      </button>
                    )}
                    <FiChevronDown className={`transition-transform ${showDestinationDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showDestinationDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <input
                          type="text"
                          value={destinationSearch}
                          onChange={(e) => setDestinationSearch(e.target.value)}
                          placeholder="Rechercher un bénéficiaire..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {loadingBeneficiaires ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Chargement...</p>
                        </div>
                      ) : filteredDestinationBeneficiaires.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Aucun bénéficiaire trouvé
                        </div>
                      ) : (
                        filteredDestinationBeneficiaires.map(beneficiaire => (
                          <div
                            key={beneficiaire.id}
                            onClick={() => {
                              setDestinationBeneficiaire(beneficiaire);
                              setShowDestinationDropdown(false);
                              setDestinationSearch('');
                            }}
                            className={`px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              destinationBeneficiaire?.id === beneficiaire.id ? 'bg-green-50' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-800">
                              {beneficiaire.nom} {beneficiaire.prenom}
                            </div>
                            <div className="text-sm text-gray-600 flex justify-between mt-1">
                              <span>{beneficiaire.matricule || 'Sans matricule'}</span>
                              <span>{beneficiaire.departement?.nom || 'Aucun Département'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Avertissement validation à deux niveaux */}
          {currentUser && validateurRequis && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <FiShield className="text-blue-600 mr-3 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-blue-800">
                    Validation à deux niveaux requise
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    En tant que <strong>{currentUser.role}</strong>, cette opération nécessite la validation 
                    par un <strong>{currentUser.role === 'ADMIN' ? 'USER' : 'ADMIN'}</strong> : 
                    <strong className="ml-1">{validateurRequis.nom} {validateurRequis.prenom}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    La demande sera créée et devra être validée dans la section <strong>"Demandes de transfert"</strong> avant que le transfert ne soit effectif.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Matériels du bénéficiaire source */}
          {sourceBeneficiaire && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">3</span>
                  Matériels de {sourceBeneficiaire.nom} {sourceBeneficiaire.prenom}
                </h3>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={selectAllMateriels}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllMateriels}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>

              {loadingMateriels ? (
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Chargement des matériels...</p>
                </div>
              ) : materielsSource.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                  <p className="text-yellow-700">Ce bénéficiaire n'a aucun matériel attribué</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materielsSource.map(materiel => {
                    const isSelected = materielsSelectionnes.some(m => m.id === materiel.id);
                    
                    return (
                      <div
                        key={materiel.id}
                        onClick={() => toggleMaterielSelection(materiel)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`mr-3 mt-1 w-5 h-5 border rounded flex items-center justify-center ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <FiCheck className="text-white text-xs" />}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div className="font-medium text-gray-800">
                                {materiel.numeroInventaire || `Matériel NS: ${materiel.numeroSerie}`}
                              </div>
                              {materiel.type && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  {materiel.type.designation}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>{`NI : ${materiel.numeroInventaire || 'Aucun'} `}</span>
                                <span>{`NS : ${materiel.numeroSerie || 'Aucun'} `}</span>
                                <span>{`Exercice : ${materiel.exercice || 'Aucun'} `}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Résumé de sélection */}
              {materielsSelectionnes.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center">
                    <FiList className="text-blue-500 mr-2" />
                    <span className="font-medium text-blue-800">
                      {materielsSelectionnes.length} matériel(s) sélectionné(s) pour le transfert
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-blue-700">
                    {materielsSelectionnes.map(m => m.numeroInventaire || `#${m.id}`).join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Date et observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-purple-100 text-purple-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">4</span>
                Date de transfert
              </h3>
              <input
                type="date"
                value={dateReaffectation}
                onChange={(e) => setDateReaffectation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-purple-100 text-purple-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">5</span>
                Observations
              </h3>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observations sur le transfert..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={loadingReaffectation}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loadingReaffectation || materielsSelectionnes.length === 0 || !sourceBeneficiaire || !destinationBeneficiaire || !validateurRequis}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loadingReaffectation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Création de la demande...
                </>
              ) : (
                <>
                  <FiArrowRight className="mr-2" />
                  Créer la demande de transfert ({materielsSelectionnes.length})
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <FiUser className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bénéficiaire Source</p>
              <p className="text-lg font-bold text-gray-800">
                {sourceBeneficiaire ? `${sourceBeneficiaire.nom} ${sourceBeneficiaire.prenom}` : 'Non sélectionné'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <FiUser className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bénéficiaire Destination</p>
              <p className="text-lg font-bold text-gray-800">
                {destinationBeneficiaire ? `${destinationBeneficiaire.nom} ${destinationBeneficiaire.prenom}` : 'Non sélectionné'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FiPackage className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Matériels Source</p>
              <p className="text-2xl font-bold text-gray-800">{materielsSource.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <FiRefreshCw className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">À transférer</p>
              <p className="text-2xl font-bold text-gray-800">{materielsSelectionnes.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiReaffectation;