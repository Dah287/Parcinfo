import React, { useState, useEffect } from 'react';
import { FiUser, FiPackage, FiCheck, FiSearch, FiX, FiChevronDown, FiShoppingCart } from 'react-icons/fi';
import { 
  affecterConfigurationComplete, 
  getMaterielsDisponiblesParPrix,
  getAllAchats,
  getAllBeneficiaires 
} from '../../services/affectationService';
import { toast } from 'react-toastify';

const AffectationComplete = () => {
  const [achats, setAchats] = useState([]);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [materielsParPrix, setMaterielsParPrix] = useState({});
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  const [selectedMateriels, setSelectedMateriels] = useState({});
  const [dateAttribution, setDateAttribution] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAchats, setLoadingAchats] = useState(true);
  const [loadingBeneficiaires, setLoadingBeneficiaires] = useState(true);
  const [loadingMateriels, setLoadingMateriels] = useState(false);
  
  // États pour les dropdowns
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [showBeneficiaireDropdown, setShowBeneficiaireDropdown] = useState(false);
  const [achatSearch, setAchatSearch] = useState('');
  const [beneficiaireSearch, setBeneficiaireSearch] = useState('');

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingAchats(true);
        setLoadingBeneficiaires(true);
        
        const [achatsRes, beneficiairesRes] = await Promise.all([
          getAllAchats(),
          getAllBeneficiaires()
        ]);
        
        // Traiter les données des achats pour extraire le nom du fournisseur
        const achatsTraites = (achatsRes.data || []).map(achat => ({
          ...achat,
          // Extraire le nom du fournisseur si c'est un objet
          fournisseurNom: getFournisseurNom(achat.fournisseur)
        }));
        
        setAchats(achatsTraites || []);
        setBeneficiaires(beneficiairesRes.data || []);
      } catch (error) {
        console.error('Erreur chargement données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoadingAchats(false);
        setLoadingBeneficiaires(false);
      }
    };

    loadData();
  }, []);

  // Fonction utilitaire pour extraire le nom du fournisseur
  const getFournisseurNom = (fournisseur) => {
    if (!fournisseur) return 'N/A';
    if (typeof fournisseur === 'string') return fournisseur;
    if (typeof fournisseur === 'object') {
      return fournisseur.nom || fournisseur.raisonSociale || fournisseur.name || 'Fournisseur inconnu';
    }
    return String(fournisseur);
  };

  // Fonction utilitaire pour formater l'affichage du fournisseur
  const formatFournisseur = (achat) => {
    if (!achat) return 'N/A';
    
    // Vérifier si on a déjà extrait le nom
    if (achat.fournisseurNom) {
      return achat.fournisseurNom;
    }
    
    // Sinon, extraire du fournisseur
    return getFournisseurNom(achat.fournisseur);
  };

  // Charger les matériels quand un achat est sélectionné
  useEffect(() => {
    if (selectedAchat) {
      loadMaterielsParPrix();
    }
  }, [selectedAchat]);

  const loadMaterielsParPrix = async () => {
    try {
      setLoadingMateriels(true);
      const response = await getMaterielsDisponiblesParPrix(selectedAchat.id);
      setMaterielsParPrix(response.data || {});
      // Réinitialiser les sélections
      setSelectedMateriels({});
    } catch (error) {
      console.error('Erreur chargement matériels:', error);
      toast.error('Erreur lors du chargement des matériels');
      setMaterielsParPrix({});
    } finally {
      setLoadingMateriels(false);
    }
  };

  // Filtrer les achats - CORRIGÉ
  const filteredAchats = achats.filter(achat => {
    const searchLower = achatSearch.toLowerCase();
    
    // Numéro d'achat
    const numeroAchat = achat.numeroAchat || achat.id || '';
    const numeroAchatStr = String(numeroAchat).toLowerCase();
    const reference = achat.reference || achat.id || '';
    // Fournisseur - gérer les différents types
    const fournisseurNom = formatFournisseur(achat).toLowerCase();
    
    // Date d'achat
    const dateAchat = achat.dateAchat || '';
    const dateAchatStr = String(dateAchat).toLowerCase();
    
    return (
      numeroAchatStr.includes(searchLower) ||
      fournisseurNom.includes(searchLower) ||
      dateAchatStr.includes(searchLower) ||
      reference.includes(searchLower) 
    );
  });

  // Filtrer les bénéficiaires
  const filteredBeneficiaires = beneficiaires.filter(beneficiaire => {
    const searchLower = beneficiaireSearch.toLowerCase();
    return (
      (beneficiaire.nom && beneficiaire.nom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.prenom && beneficiaire.prenom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.matricule && beneficiaire.matricule.toLowerCase().includes(searchLower)) ||
      (beneficiaire.email && beneficiaire.email.toLowerCase().includes(searchLower))
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier qu'un matériel est sélectionné pour chaque prix
    const prixKeys = Object.keys(materielsParPrix);
    const missingSelections = prixKeys.filter(prix => !selectedMateriels[prix]);
    
    if (missingSelections.length > 0) {
      toast.warning(`Veuillez sélectionner un matériel pour: ${missingSelections.join(', ')}`);
      return;
    }

    if (!selectedBeneficiaire) {
      toast.warning('Veuillez sélectionner un bénéficiaire');
      return;
    }

    try {
      setLoading(true);
      
      // Convertir les sélections en liste d'IDs
      const materielIds = Object.values(selectedMateriels).map(m => m.id);

      const dto = {
        achatId: selectedAchat.id,
        beneficiaireId: selectedBeneficiaire.id,
        materielIds: materielIds, // Note: c'est materielIds (pas materielIds)
        dateAttribution: dateAttribution,
        observations: observations
      };
   console.log('DTO à envoyer:', dto);
      const response = await affecterConfigurationComplete(dto);
      console.log('Réponse affectation complète:', response);
      if (response.data) {
        toast.success('Attribution complète effectuée avec succès !');
        
        // Recharger les matériels disponibles
        await loadMaterielsParPrix();
        
        // Réinitialiser la sélection du bénéficiaire
        setSelectedBeneficiaire(null);
        setObservations('');
        setSelectedMateriels({});
      }
    } catch (error) {
      console.error('Erreur attribution complète:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'attribution complète');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAchat(null);
    setSelectedBeneficiaire(null);
    setSelectedMateriels({});
    setMaterielsParPrix({});
    setDateAttribution(new Date().toISOString().split('T')[0]);
    setObservations('');
    setAchatSearch('');
    setBeneficiaireSearch('');
    setShowAchatDropdown(false);
    setShowBeneficiaireDropdown(false);
  };

  const clearAchatSelection = () => {
    setSelectedAchat(null);
    setAchatSearch('');
    setMaterielsParPrix({});
    setSelectedMateriels({});
  };

  const clearBeneficiaireSelection = () => {
    setSelectedBeneficiaire(null);
    setBeneficiaireSearch('');
  };

  const selectMaterielForPrix = (prix, materiel) => {
    setSelectedMateriels(prev => ({
      ...prev,
      [prix]: materiel
    }));
  };

  const getSelectedMaterielCount = () => {
    return Object.keys(selectedMateriels).length;
  };

  const getTotalPrixCount = () => {
    return Object.keys(materielsParPrix).length;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-lg mr-4">
            <FiShoppingCart className="text-indigo-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Affectation Complète CAD</h2>
            <p className="text-gray-600">Attribuer un matériel de chaque prix d'un achat à un bénéficiaire</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Sélection de l'achat */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
              Sélectionnez un achat
            </h3>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowAchatDropdown(!showAchatDropdown);
                  setShowBeneficiaireDropdown(false);
                }}
                className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                  selectedAchat 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <FiShoppingCart className="mr-3 text-indigo-500" />
                  <div>
                    {selectedAchat ? (
                      <>
                        <div className="font-medium text-gray-800">
                          {selectedAchat.reference || selectedAchat.id}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatFournisseur(selectedAchat)} • {selectedAchat.dateAchat || 'N/A'}
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
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAchatSelection();
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
                        placeholder="Rechercher un achat..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="py-2">
                    {loadingAchats ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
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
                          onClick={() => {
                            setSelectedAchat(achat);
                            setShowAchatDropdown(false);
                            setAchatSearch('');
                          }}
                          className={`px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            selectedAchat?.id === achat.id ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-800">
                            {achat.reference || achat.id}
                          </div>
                          <div className="text-sm text-gray-600 flex justify-between mt-1">
                            <span>{formatFournisseur(achat)}</span>
                            <span>{achat.dateAchat || 'N/A'}</span>
                          </div>
                          {achat.totalHT && (
                            <div className="text-xs text-gray-500 mt-1">
                              Total: {achat.totalHT} DH HT
                            </div>
                          )}
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
                  <div className="flex-1">
                    <span className="font-medium text-green-800">Achat sélectionné:</span>
                    <div className="text-sm text-green-700">
                      Achat #{selectedAchat.numeroAchat || selectedAchat.id} • 
                      {formatFournisseur(selectedAchat)} • 
                      {selectedAchat.dateAchat || ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAchatDropdown(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Affichage des matériels par prix */}
          {selectedAchat && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
                Sélectionnez un matériel par prix
              </h3>

              {loadingMateriels ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Chargement des matériels...</p>
                </div>
              ) : Object.keys(materielsParPrix).length === 0 ? (
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-yellow-800 font-medium">
                    Aucun matériel disponible pour cet achat
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    Tous les matériels de cet achat ont déjà été attribués
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {Object.entries(materielsParPrix).map(([prix, materiels]) => (
                      <div key={prix} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b">
                          <div className="flex items-center">
                            <div className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                              <span className="text-indigo-700 font-bold text-sm">
                                {Number(prix).toLocaleString('fr-FR')} FCFA
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{prix} FCFA</h4>
                              <p className="text-sm text-gray-500">{materiels.length} matériel(s) disponible(s)</p>
                            </div>
                          </div>
                          {selectedMateriels[prix] && (
                            <div className="flex items-center text-green-600">
                              <FiCheck className="mr-2" />
                              <span className="text-sm font-medium">Sélectionné</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {materiels.map(materiel => (
                            <div
                              key={materiel.id}
                              onClick={() => selectMaterielForPrix(prix, materiel)}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                selectedMateriels[prix]?.id === materiel.id
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start">
                                <input
                                  type="radio"
                                  name={`prix-${prix}`}
                                  checked={selectedMateriels[prix]?.id === materiel.id}
                                  onChange={() => selectMaterielForPrix(prix, materiel)}
                                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="ml-3 flex-1">
                                  <div className="font-medium text-gray-800">
                                    {materiel.numeroSerie || `Matériel #${materiel.id}`}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {materiel.numeroSerie && (
                                      <div className="text-xs text-gray-500">
                                        S/N: {materiel.numeroSerie}
                                      </div>
                                    )}
                                    {materiel.marque?.nom && (
                                      <div className="text-xs text-gray-500">
                                        Marque: {materiel.marque.nom}
                                      </div>
                                    )}
                                    {materiel.modele && (
                                      <div className="text-xs text-gray-500">
                                        Modèle: {materiel.type?.designation}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Résumé de la sélection */}
                  {getTotalPrixCount() > 0 && (
                    <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-indigo-800">Matériels sélectionnés:</span>
                          <div className="text-2xl font-bold text-indigo-700 mt-1">
                            {getSelectedMaterielCount()} / {getTotalPrixCount()}
                          </div>
                          <p className="text-sm text-indigo-600 mt-1">
                            {getSelectedMaterielCount() === getTotalPrixCount() 
                              ? 'Configuration complète prête' 
                              : `Sélectionnez ${getTotalPrixCount() - getSelectedMaterielCount()} matériel(s) restant(s)`}
                          </p>
                        </div>
                        {getSelectedMaterielCount() > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedMateriels({})}
                            className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                          >
                            Tout désélectionner
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Sélection du bénéficiaire */}
          {selectedAchat && getTotalPrixCount() > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">3</span>
                Sélectionnez un bénéficiaire
              </h3>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowBeneficiaireDropdown(!showBeneficiaireDropdown);
                    setShowAchatDropdown(false);
                  }}
                  className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                    selectedBeneficiaire 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <FiUser className="mr-3 text-indigo-500" />
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
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearBeneficiaireSelection();
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
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {loadingBeneficiaires ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
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
                            onClick={() => {
                              setSelectedBeneficiaire(beneficiaire);
                              setShowBeneficiaireDropdown(false);
                              setBeneficiaireSearch('');
                            }}
                            className={`px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              selectedBeneficiaire?.id === beneficiaire.id ? 'bg-indigo-50' : ''
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
                    <div className="flex-1">
                      <span className="font-medium text-green-800">Bénéficiaire sélectionné:</span>
                      <div className="text-sm text-green-700">
                        {selectedBeneficiaire.nom} {selectedBeneficiaire.prenom} • 
                        {selectedBeneficiaire.matricule ? ` ${selectedBeneficiaire.matricule} •` : ''}
                        {selectedBeneficiaire.departement?.nom || selectedBeneficiaire.service?.nom || ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBeneficiaireDropdown(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Changer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date d'attribution */}
          {selectedAchat && getTotalPrixCount() > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">4</span>
                Date d'attribution
              </h3>
              <input
                type="date"
                value={dateAttribution}
                onChange={(e) => setDateAttribution(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}

          {/* Observations */}
          {selectedAchat && getTotalPrixCount() > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">5</span>
                Observations (optionnel)
              </h3>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ajoutez des observations concernant cette attribution complète..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Boutons d'action */}
          {selectedAchat && getTotalPrixCount() > 0 && (
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || getSelectedMaterielCount() !== getTotalPrixCount() || !selectedBeneficiaire}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Attribution en cours...
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2" />
                    Attribuer {getSelectedMaterielCount()} matériel(s)
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AffectationComplete;