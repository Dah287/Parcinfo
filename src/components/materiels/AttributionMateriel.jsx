import React, { useState, useEffect } from 'react';
import { FiUser, FiPackage, FiCheck, FiSearch, FiX, FiInfo, FiChevronDown, FiShoppingCart, FiDollarSign } from 'react-icons/fi';
import { attribuerMateriel, getAllMateriels, getMaterielsDisponiblesParPrix } from '../../services/materialService';
import { getAllBeneficiaires } from '../../services/beneficiareService';
import { getAllAchats, getPrixByAchat } from '../../services/achatService';
import { toast } from 'react-toastify';

const AttributionMateriel = () => {
  // États pour les données
  const [achats, setAchats] = useState([]);
  const [prixList, setPrixList] = useState([]);
  const [materielsDisponibles, setMaterielsDisponibles] = useState([]);
  const [beneficiaires, setBeneficiaires] = useState([]);
  
  // États pour les sélections (Nouveau workflow)
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [selectedPrix, setSelectedPrix] = useState(null);
  const [selectedMateriel, setSelectedMateriel] = useState(null);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  
  // États pour le formulaire
  const [dateAttribution, setDateAttribution] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  
  // États de chargement par étape
  const [loadingAchats, setLoadingAchats] = useState(true);
  const [loadingPrix, setLoadingPrix] = useState(false);
  const [loadingMateriels, setLoadingMateriels] = useState(false);
  const [loadingBeneficiaires, setLoadingBeneficiaires] = useState(true);
  
  // États pour les dropdowns
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [showPrixDropdown, setShowPrixDropdown] = useState(false);
  const [showMaterielDropdown, setShowMaterielDropdown] = useState(false);
  const [showBeneficiaireDropdown, setShowBeneficiaireDropdown] = useState(false);
  
  // États pour la recherche
  const [achatSearch, setAchatSearch] = useState('');
  const [prixSearch, setPrixSearch] = useState('');
  const [materielSearch, setMaterielSearch] = useState('');
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
        
        // ✅ S'assurer que ce sont des tableaux
        setAchats(Array.isArray(achatsRes.data) ? achatsRes.data : []);
        setBeneficiaires(Array.isArray(beneficiairesRes.data) ? beneficiairesRes.data : []);
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

  // 🔹 ÉTAPE 1 → ÉTAPE 2 : Charger les prix quand un achat est sélectionné
  useEffect(() => {
    const loadPrix = async () => {
      if (!selectedAchat || !selectedAchat.id) {
        setPrixList([]);
        setSelectedPrix(null);
        return;
      }

      try {
        setLoadingPrix(true);
        const prixRes = await getPrixByAchat(selectedAchat.id);
        
        // ✅ S'assurer que c'est un tableau
        let data = prixRes.data;
        if (Array.isArray(data)) {
          setPrixList(data);
        } else if (data && typeof data === 'object') {
          const arrayData = data.content || data.prix || data.data || data.items || [];
          setPrixList(Array.isArray(arrayData) ? arrayData : []);
        } else {
          setPrixList([]);
        }
        
        // Réinitialiser les sélections suivantes
        setSelectedPrix(null);
        setSelectedMateriel(null);
        setMaterielsDisponibles([]);
      } catch (error) {
        console.error('Erreur chargement prix:', error);
        toast.error('Erreur lors du chargement des prix');
        setPrixList([]);
      } finally {
        setLoadingPrix(false);
      }
    };

    loadPrix();
  }, [selectedAchat]);

  // 🔹 ÉTAPE 2 → ÉTAPE 3 : Charger les matériels quand un prix est sélectionné
  useEffect(() => {
    const loadMateriels = async () => {
      // ✅ VALIDATION : Ne pas appeler si pas de prix sélectionné
      if (!selectedPrix || !selectedPrix.id) {
        setMaterielsDisponibles([]);
        setSelectedMateriel(null);
        return;
      }

      try {
        setLoadingMateriels(true);
        
        const materielsRes = await getMaterielsDisponiblesParPrix(selectedPrix.id);
        
        // ✅ S'assurer que c'est un tableau
        let data = materielsRes.data;
        console.log('Réponse API matériels:', data);
        
        if (Array.isArray(data)) {
          setMaterielsDisponibles(data);
        } else if (data && typeof data === 'object') {
          const arrayData = data.content || data.materiels || data.data || data.items || [];
          setMaterielsDisponibles(Array.isArray(arrayData) ? arrayData : []);
        } else {
          setMaterielsDisponibles([]);
        }
        
        setSelectedMateriel(null);
      } catch (error) {
        console.error('Erreur chargement matériels:', error);
        toast.error('Erreur lors du chargement des matériels');
        setMaterielsDisponibles([]);
      } finally {
        setLoadingMateriels(false);
      }
    };

    loadMateriels();
  }, [selectedPrix]);

  // Filtrer les achats
  const filteredAchats = Array.isArray(achats) ? achats.filter(achat => {
    if (!achat) return false;
    const searchLower = achatSearch.toLowerCase();
    return (
      (achat.reference && achat.reference.toLowerCase().includes(searchLower)) ||
      (achat.objet && achat.objet.toLowerCase().includes(searchLower)) ||
      (achat.fournisseur?.nom && achat.fournisseur.nom.toLowerCase().includes(searchLower))
    );
  }) : [];

  // Filtrer les prix
  const filteredPrix = Array.isArray(prixList) ? prixList.filter(prix => {
    if (!prix) return false;
    const searchLower = prixSearch.toLowerCase();
    return (
      (prix.designation && prix.designation.toLowerCase().includes(searchLower)) ||
      (prix.marque && prix.marque.toLowerCase().includes(searchLower)) ||
      (prix.modele && prix.modele.toLowerCase().includes(searchLower))
    );
  }) : [];

  // Filtrer les matériels
  const filteredMateriels = Array.isArray(materielsDisponibles) ? materielsDisponibles.filter(materiel => {
    if (!materiel) return false;
    const searchLower = materielSearch.toLowerCase();
    
    const numeroInventaireMatch = materiel.numeroInventaire && 
                                 materiel.numeroInventaire.toLowerCase().includes(searchLower);
    const numeroSerieMatch = materiel.numeroSerie && 
                            materiel.numeroSerie.toLowerCase().includes(searchLower);
    const typeMatch = materiel.type?.designation && 
                     materiel.type.designation.toLowerCase().includes(searchLower);
    
    return numeroInventaireMatch || numeroSerieMatch || typeMatch;
  }) : [];

  // Filtrer les bénéficiaires
  const filteredBeneficiaires = Array.isArray(beneficiaires) ? beneficiaires.filter(beneficiaire => {
    const searchLower = beneficiaireSearch.toLowerCase();
    return (
      (beneficiaire.nom && beneficiaire.nom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.prenom && beneficiaire.prenom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.matricule && beneficiaire.matricule.toLowerCase().includes(searchLower)) ||
      (beneficiaire.email && beneficiaire.email.toLowerCase().includes(searchLower))
    );
  }) : [];

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
        observations: observations,
        achatId: selectedAchat?.id,
        prixId: selectedPrix?.id
      };

      const response = await attribuerMateriel(dto);
      
      if (response.data) {
        toast.success('Matériel attribué avec succès !');
        resetForm();
        // Recharger les achats pour mettre à jour les disponibilités
        const achatsRes = await getAllAchats();
        setAchats(Array.isArray(achatsRes.data) ? achatsRes.data : []);
      }
    } catch (error) {
      console.error('Erreur attribution:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'attribution');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAchat(null);
    setSelectedPrix(null);
    setSelectedMateriel(null);
    setSelectedBeneficiaire(null);
    setDateAttribution(new Date().toISOString().split('T')[0]);
    setObservations('');
    setAchatSearch('');
    setPrixSearch('');
    setMaterielSearch('');
    setBeneficiaireSearch('');
    setPrixList([]);
    setMaterielsDisponibles([]);
    setShowAchatDropdown(false);
    setShowPrixDropdown(false);
    setShowMaterielDropdown(false);
    setShowBeneficiaireDropdown(false);
  };

  // Composant Dropdown réutilisable
  const DropdownField = ({ 
    label, 
    stepNumber, 
    selectedValue, 
    showDropdown, 
    setShowDropdown, 
    searchValue, 
    setSearchValue, 
    filteredItems, 
    loading, 
    placeholder, 
    onSelect, 
    onClear, 
    renderDisplay, 
    renderItem,
    icon: Icon,
    disabled = false
  }) => (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
          selectedValue ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {stepNumber}
        </span>
        {label}
      </h3>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              setShowDropdown(!showDropdown);
            }
          }}
          disabled={disabled}
          className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 
            selectedValue ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center">
            <Icon className={`mr-3 ${selectedValue ? 'text-green-500' : 'text-blue-500'}`} />
            <div>
              {selectedValue ? (
                renderDisplay(selectedValue)
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {selectedValue && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="mr-2 text-gray-400 hover:text-gray-600"
              >
                <FiX size={18} />
              </button>
            )}
            <FiChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showDropdown && !disabled && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
            <div className="p-3 border-b">
              <div className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
            
            <div className="py-2">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Chargement...</p>
                </div>
              ) : !filteredItems || filteredItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchValue.trim() === '' ? 'Aucun élément trouvé' : `Aucun résultat pour "${searchValue}"`}
                </div>
              ) : (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      setShowDropdown(false);
                      setSearchValue('');
                    }}
                    className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                      selectedValue?.id === item.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    {renderItem(item)}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {selectedValue && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <FiCheck className="text-green-500 mr-2" />
            <div className="flex-1">
              <span className="font-medium text-green-800">Sélectionné:</span>
              <div className="text-sm text-green-700">
                {renderDisplay(selectedValue)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDropdown(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Changer
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <FiPackage className="text-blue-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Attribution de Matériel</h2>
            <p className="text-gray-600">Workflow : Achat → Prix → Matériel → Bénéficiaire</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[
              { label: 'Achat', icon: FiShoppingCart, completed: !!selectedAchat },
              { label: 'Prix', icon: FiDollarSign, completed: !!selectedPrix },
              { label: 'Matériel', icon: FiPackage, completed: !!selectedMateriel },
              { label: 'Bénéficiaire', icon: FiUser, completed: !!selectedBeneficiaire }
            ].map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <step.icon size={20} />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.completed ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ÉTAPE 1 : Sélection de l'achat */}
          <DropdownField
            label="Sélectionnez un achat"
            stepNumber={1}
            selectedValue={selectedAchat}
            showDropdown={showAchatDropdown}
            setShowDropdown={setShowAchatDropdown}
            searchValue={achatSearch}
            setSearchValue={setAchatSearch}
            filteredItems={filteredAchats}
            loading={loadingAchats}
            placeholder="Cliquez pour sélectionner un achat..."
            icon={FiShoppingCart}
            onSelect={setSelectedAchat}
            onClear={() => {
              setSelectedAchat(null);
              setSelectedPrix(null);
              setSelectedMateriel(null);
              setPrixList([]);
              setMaterielsDisponibles([]);
            }}
            renderDisplay={(achat) => (
              <>
                <div className="font-medium text-gray-800">
                  {achat.reference || `Achat #${achat.id}`}
                </div>
                <div className="text-sm text-gray-600">
                  {achat.objet || 'Sans objet'} 
                  {achat.fournisseur?.nom && ` • ${achat.fournisseur.nom}`}
                </div>
              </>
            )}
            renderItem={(achat) => (
              <>
                <div className="font-medium text-gray-800">
                  {achat.reference || `Achat #${achat.id}`}
                </div>
                <div className="text-sm text-gray-600 flex justify-between mt-1">
                  <span>{achat.objet || 'Sans objet'}</span>
                  <span>{achat.fournisseur?.nom || 'N/A'}</span>
                </div>
              </>
            )}
          />

          {/* ÉTAPE 2 : Sélection du prix */}
          <DropdownField
            label="Sélectionnez un prix"
            stepNumber={2}
            selectedValue={selectedPrix}
            showDropdown={showPrixDropdown}
            setShowDropdown={setShowPrixDropdown}
            searchValue={prixSearch}
            setSearchValue={setPrixSearch}
            filteredItems={filteredPrix}
            loading={loadingPrix}
            placeholder={!selectedAchat ? "Sélectionnez d'abord un achat" : "Cliquez pour sélectionner un prix..."}
            icon={FiDollarSign}
            disabled={!selectedAchat}
            onSelect={setSelectedPrix}
            onClear={() => {
              setSelectedPrix(null);
              setSelectedMateriel(null);
              setMaterielsDisponibles([]);
            }}
            renderDisplay={(prix) => (
              <>
                <div className="font-medium text-gray-800">
                  {prix.designation || `Prix #${prix.id}`}
                </div>
                <div className="text-sm text-gray-600">
                  {prix.numeroPrix && `${prix.numeroPrix} • `}
                  {prix.marque && `${prix.marque} • `}
                  {prix.modele && `${prix.modele} • `}
               
                </div>
              </>
            )}
            renderItem={(prix) => (
              <>
                <div className="font-medium text-gray-800">
                  {`Prix : ${prix.numeroPrix} • ${prix.nature}`}
                </div>
                <div className="text-sm text-gray-600 flex justify-between mt-1">
                  <span>{prix.marque || 'N/A'} {prix.modele && `• ${prix.modele}`}</span>

                </div>
              </>
            )}
          />

          {/* ÉTAPE 3 : Sélection du matériel */}
          <DropdownField
            label="Sélectionnez un matériel disponible"
            stepNumber={3}
            selectedValue={selectedMateriel}
            showDropdown={showMaterielDropdown}
            setShowDropdown={setShowMaterielDropdown}
            searchValue={materielSearch}
            setSearchValue={setMaterielSearch}
            filteredItems={filteredMateriels}
            loading={loadingMateriels}
            placeholder={!selectedPrix ? "Sélectionnez d'abord un prix" : "Cliquez pour sélectionner un matériel..."}
            icon={FiPackage}
            disabled={!selectedPrix}
            onSelect={setSelectedMateriel}
            onClear={setSelectedMateriel}
            renderDisplay={(materiel) => (
              <>
                <div className="font-medium text-gray-800">
                  {materiel.numeroSerie || `Matériel Sans S/N: ${materiel.id}`}
                </div>
                <div className="text-sm text-gray-600">
                  {materiel.type?.designation || 'N/A'} 
                </div>
              </>
            )}
            renderItem={(materiel) => (
              <>
                <div className="font-medium text-gray-800">
                  {` (S/N: ${materiel.numeroSerie})`|| `Matériel sans S/N: ${materiel.id}`}
                 
                </div>
                <div className="text-sm text-gray-600 flex justify-between mt-1">
                  <span>{materiel.type?.designation || 'N/A'}</span>
                  <span>{materiel.marque?.nom || 'N/A'}</span>
                </div>
              </>
            )}
          />

          {/* ÉTAPE 4 : Sélection du bénéficiaire */}
          <DropdownField
            label="Sélectionnez un bénéficiaire"
            stepNumber={4}
            selectedValue={selectedBeneficiaire}
            showDropdown={showBeneficiaireDropdown}
            setShowDropdown={setShowBeneficiaireDropdown}
            searchValue={beneficiaireSearch}
            setSearchValue={setBeneficiaireSearch}
            filteredItems={filteredBeneficiaires}
            loading={loadingBeneficiaires}
            placeholder={!selectedMateriel ? "Sélectionnez d'abord un matériel" : "Cliquez pour sélectionner un bénéficiaire..."}
            icon={FiUser}
            disabled={!selectedMateriel}
            onSelect={setSelectedBeneficiaire}
            onClear={setSelectedBeneficiaire}
            renderDisplay={(beneficiaire) => (
              <>
                <div className="font-medium text-gray-800">
                  {beneficiaire.nom} {beneficiaire.prenom}
                </div>
                <div className="text-sm text-gray-600">
                  {beneficiaire.matricule ? `${beneficiaire.matricule} • ` : ''}
                  {beneficiaire.departement?.nom || beneficiaire.service?.nom || 'N/A'}
                </div>
              </>
            )}
            renderItem={(beneficiaire) => (
              <>
                <div className="font-medium text-gray-800">
                  {beneficiaire.nom} {beneficiaire.prenom}
                </div>
                <div className="text-sm text-gray-600 flex justify-between mt-1">
                  <span>{beneficiaire.matricule ? `Mat: ${beneficiaire.matricule}` : 'Sans matricule'}</span>
                  <span>{beneficiaire.departement?.nom || beneficiaire.service?.nom || 'N/A'}</span>
                </div>
              </>
            )}
          />

          {/* Date d'attribution */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">5</span>
              Date d'attribution
            </h3>
            <input
              type="date"
              value={dateAttribution}
              onChange={(e) => setDateAttribution(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Observations */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">6</span>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FiShoppingCart className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Achats</p>
              <p className="text-2xl font-bold text-gray-800">{Array.isArray(achats) ? achats.length : 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <FiDollarSign className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Prix chargés</p>
              <p className="text-2xl font-bold text-gray-800">{Array.isArray(prixList) ? prixList.length : 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <FiPackage className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Matériels dispo</p>
              <p className="text-2xl font-bold text-gray-800">{Array.isArray(materielsDisponibles) ? materielsDisponibles.length : 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <FiUser className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Prêt à attribuer</p>
              <p className="text-2xl font-bold text-gray-800">
                {selectedMateriel && selectedBeneficiaire ? '✓' : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributionMateriel;