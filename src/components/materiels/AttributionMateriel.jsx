import React, { useState, useEffect } from 'react';
import { FiUser, FiPackage, FiCheck, FiSearch, FiX, FiInfo, FiChevronDown } from 'react-icons/fi';
import { attribuerMateriel, getAllMateriels } from '../../services/materialService';
import { getAllBeneficiaires } from '../../services/beneficiareService';
import { toast } from 'react-toastify';

const AttributionMateriel = () => {
  const [materielsDisponibles, setMaterielsDisponibles] = useState([]);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [selectedMateriel, setSelectedMateriel] = useState(null);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  const [dateAttribution, setDateAttribution] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMateriels, setLoadingMateriels] = useState(true);
  const [loadingBeneficiaires, setLoadingBeneficiaires] = useState(true);
  
  // États pour les dropdowns
  const [showMaterielDropdown, setShowMaterielDropdown] = useState(false);
  const [showBeneficiaireDropdown, setShowBeneficiaireDropdown] = useState(false);
  const [materielSearch, setMaterielSearch] = useState('');
  const [beneficiaireSearch, setBeneficiaireSearch] = useState('');

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingMateriels(true);
        setLoadingBeneficiaires(true);
        
        const [materielsRes, beneficiairesRes] = await Promise.all([
          getAllMateriels(),
          getAllBeneficiaires()
        ]);
        
        setMaterielsDisponibles(materielsRes.data || []);
        setBeneficiaires(beneficiairesRes.data || []);
      } catch (error) {
        console.error('Erreur chargement données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoadingMateriels(false);
        setLoadingBeneficiaires(false);
      }
    };

    loadData();
  }, []);

  // Filtrer les matériels - VERSION CORRIGÉE avec vérification de null/undefined
  const filteredMateriels = materielsDisponibles.filter(materiel => {
    if (!materiel) return false;
    
    const searchLower = materielSearch.toLowerCase();
    
    // Vérifier le numéro d'inventaire
    const numeroInventaireMatch = materiel.numeroInventaire && 
                                 materiel.numeroInventaire.toLowerCase().includes(searchLower);
    
    // Vérifier le numéro de série
    const numeroSerieMatch = materiel.numeroSerie && 
                            materiel.numeroSerie.toLowerCase().includes(searchLower);
    
    // Vérifier le type
    const typeMatch = materiel.type?.designation && 
                     materiel.type.designation.toLowerCase().includes(searchLower);
    
    // Vérifier la marque
    const marqueMatch = materiel.marque?.nom && 
                       materiel.marque.nom.toLowerCase().includes(searchLower);
    
    return numeroInventaireMatch || numeroSerieMatch || typeMatch || marqueMatch;
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
    
    if (!selectedMateriel || !selectedBeneficiaire) {
      toast.warning('Veuillez sélectionner un matériel et un bénéficiaire');
      return;
    }

    try {
      setLoading(true);
      
      const dto = {
        materielId: selectedMateriel.id,
        beneficiaireId: selectedBeneficiaire.id,
        dateAttribution: dateAttribution,
        observations: observations
      };

      const response = await attribuerMateriel(dto);
      
      if (response.data) {
        toast.success('Matériel attribué avec succès !');
        
        // Réinitialiser le formulaire
        resetForm();
        
        // Mettre à jour la liste des matériels disponibles
        const materielsRes = await getAllMateriels();
        setMaterielsDisponibles(materielsRes.data || []);
      }
    } catch (error) {
      console.error('Erreur attribution:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'attribution');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMateriel(null);
    setSelectedBeneficiaire(null);
    setDateAttribution(new Date().toISOString().split('T')[0]);
    setObservations('');
    setMaterielSearch('');
    setBeneficiaireSearch('');
    setShowMaterielDropdown(false);
    setShowBeneficiaireDropdown(false);
  };

  const clearMaterielSelection = () => {
    setSelectedMateriel(null);
    setMaterielSearch('');
  };

  const clearBeneficiaireSelection = () => {
    setSelectedBeneficiaire(null);
    setBeneficiaireSearch('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <FiPackage className="text-blue-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Attribution de Matériel</h2>
            <p className="text-gray-600">Attribuer un matériel disponible à un bénéficiaire</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Sélection du matériel */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
              Sélectionnez un matériel disponible
            </h3>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowMaterielDropdown(!showMaterielDropdown);
                  setShowBeneficiaireDropdown(false);
                }}
                className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                  selectedMateriel 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <FiPackage className="mr-3 text-blue-500" />
                  <div>
                    {selectedMateriel ? (
                      <>
                        <div className="font-medium text-gray-800">
                          {selectedMateriel.numeroInventaire || 'Sans numéro d\'inventaire'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedMateriel.type?.designation || 'N/A'} • {selectedMateriel.marque?.nom || 'N/A'}  • {selectedMateriel.numeroSerie || 'N/A'}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500">Cliquez pour sélectionner un matériel...</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {selectedMateriel && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearMaterielSelection();
                      }}
                      className="mr-2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={18} />
                    </button>
                  )}
                  <FiChevronDown className={`transition-transform ${showMaterielDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showMaterielDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  <div className="p-3 border-b">
                    <div className="relative">
                      <input
                        type="text"
                        value={materielSearch}
                        onChange={(e) => setMaterielSearch(e.target.value)}
                        placeholder="Rechercher par n° inventaire, série, type..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="py-2">
                    {loadingMateriels ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Chargement des matériels...</p>
                      </div>
                    ) : filteredMateriels.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {materielSearch.trim() === '' 
                          ? 'Aucun matériel disponible trouvé' 
                          : `Aucun matériel trouvé pour "${materielSearch}"`}
                      </div>
                    ) : (
                      filteredMateriels.map(materiel => (
                        <div
                          key={materiel.id}
                          onClick={() => {
                            setSelectedMateriel(materiel);
                            setShowMaterielDropdown(false);
                            setMaterielSearch('');
                          }}
                          className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            selectedMateriel?.id === materiel.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-800">
                            {materiel.numeroInventaire || `Matériel #${materiel.id}`}
                            {materiel.numeroSerie && ` (S/N: ${materiel.numeroSerie})`}
                          </div>
                          <div className="text-sm text-gray-600 flex justify-between mt-1">
                            <span>{materiel.type?.designation || 'N/A'}</span>
                            <span>{materiel.marque?.nom || 'N/A'}</span>
                          </div>
                          {materiel.caracteristiques && Object.keys(materiel.caracteristiques).length > 0 && (
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {Object.entries(materiel.caracteristiques)
                                .slice(0, 2)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')}
                              {Object.keys(materiel.caracteristiques).length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedMateriel && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" />
                  <div className="flex-1">
                    <span className="font-medium text-green-800">Matériel sélectionné:</span>
                    <div className="text-sm text-green-700">
                      {selectedMateriel.numeroInventaire || `Matériel #${selectedMateriel.id}`} • 
                      {selectedMateriel.type?.designation ? ` ${selectedMateriel.type.designation} •` : ''}
                      {selectedMateriel.marque?.nom ? ` ${selectedMateriel.marque.nom} •` : ''}
                      {selectedMateriel.numeroSerie ? ` S/N: ${selectedMateriel.numeroSerie}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMaterielDropdown(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sélection du bénéficiaire */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
              Sélectionnez un bénéficiaire
            </h3>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowBeneficiaireDropdown(!showBeneficiaireDropdown);
                  setShowMaterielDropdown(false);
                }}
                className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                  selectedBeneficiaire 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <FiUser className="mr-3 text-blue-500" />
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
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="py-2">
                    {loadingBeneficiaires ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
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
                          className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            selectedBeneficiaire?.id === beneficiaire.id ? 'bg-blue-50' : ''
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
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Date d'attribution */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">3</span>
              Date d'attribution
            </h3>
            <input
              type="date"
              value={dateAttribution}
              onChange={(e) => setDateAttribution(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Par défaut, la date du jour est sélectionnée
            </p>
          </div>

          {/* Observations */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">4</span>
              Observations (optionnel)
            </h3>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ajoutez des observations concernant cette attribution..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Boutons d'action */}
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
              disabled={loading || !selectedMateriel || !selectedBeneficiaire}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Attribution en cours...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Attribuer le matériel
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FiPackage className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Matériels disponibles</p>
              <p className="text-2xl font-bold text-gray-800">{materielsDisponibles.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <FiUser className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bénéficiaires</p>
              <p className="text-2xl font-bold text-gray-800">{beneficiaires.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <FiInfo className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Prêt pour attribution</p>
              <p className="text-2xl font-bold text-gray-800">
                {selectedMateriel && selectedBeneficiaire ? '1' : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributionMateriel;