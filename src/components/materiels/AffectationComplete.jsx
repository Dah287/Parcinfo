import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiPackage, FiCheck, FiSearch, FiX, FiChevronDown, 
  FiShoppingCart, FiAlertCircle, FiTrash2 
} from 'react-icons/fi';
import { 
  affecterConfigurationComplete, 
  getMaterielsDisponiblesParPrix,
  getAllAchats,
  getAllBeneficiaires 
} from '../../services/affectationService';
import { toast } from 'react-toastify';

const AffectationComplete = () => {
  // === ÉTATS ===
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
  
  // Dropdowns
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [showBeneficiaireDropdown, setShowBeneficiaireDropdown] = useState(false);
  const [achatSearch, setAchatSearch] = useState('');
  const [beneficiaireSearch, setBeneficiaireSearch] = useState('');

// === NOUVEAUX ÉTATS (à ajouter avec les autres useState) ===
const [showSuccess, setShowSuccess] = useState(false);
const [lastAttribution, setLastAttribution] = useState(null);

  // === CHARGEMENT INITIAL ===
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingAchats(true);
        setLoadingBeneficiaires(true);
        
        const [achatsRes, beneficiairesRes] = await Promise.all([
          getAllAchats(),
          getAllBeneficiaires()
        ]);
        
        const achatsTraites = (achatsRes.data || []).map(achat => ({
          ...achat,
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

  // === UTILITAIRES ===
  const getFournisseurNom = (fournisseur) => {
    if (!fournisseur) return 'N/A';
    if (typeof fournisseur === 'string') return fournisseur;
    if (typeof fournisseur === 'object') {
      return fournisseur.nom || fournisseur.raisonSociale || fournisseur.name || 'Fournisseur inconnu';
    }
    return String(fournisseur);
  };

  const formatFournisseur = (achat) => {
    if (!achat) return 'N/A';
    return achat.fournisseurNom || getFournisseurNom(achat.fournisseur);
  };

  // === CHARGEMENT MATÉRIELS ===
  useEffect(() => {
    if (selectedAchat) {
      loadMaterielsParPrix();
    }
  }, [selectedAchat]);

const loadMaterielsParPrix = async () => {
  try {
    setLoadingMateriels(true);
    const response = await getMaterielsDisponiblesParPrix(selectedAchat.id);
    const rawData = response.data || {};
    console.log('Matériels disponibles par prix (raw):', rawData);
    // 🔧 Normalisation de la structure
    const normalizedData = {};
    
    Object.entries(rawData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Cas 1: Structure directe { "1000": [materiels] }
        normalizedData[key] = {
          prixValue: key,
          designation: null,
          materiels: value
        };
      } else if (value && typeof value === 'object') {
        // Cas 2: Structure imbriquée { "1000": { prix: {...}, materiels: [...] } }
        if (value.materiels && Array.isArray(value.materiels)) {
          normalizedData[key] = {
            prixValue: value.prix?.numeroPrix || value.prix?.id || key,
            designation: value.prix?.designation || value.prix?.typeImprimante || null,
            materiels: value.materiels
          };
        } else {
          // Cas 3: L'objet est directement le prix avec materiels en propriété
          const prixValue = value.numeroPrix || value.id || key;
          const designation = value.designation || value.typeImprimante || null;
          
          // Chercher les matériels dans les propriétés de l'objet
          const materiels = value.materiels || value.materielList || [];
          
          normalizedData[key] = {
            prixValue,
            designation,
            materiels: Array.isArray(materiels) ? materiels : []
          };
        }
      }
    });
    
    setMaterielsParPrix(normalizedData);
    setSelectedMateriels({});
  } catch (error) {
    console.error('Erreur chargement matériels:', error);
    toast.error('Erreur lors du chargement des matériels');
    setMaterielsParPrix({});
  } finally {
    setLoadingMateriels(false);
  }
};

  // === FILTRES ===
  const filteredAchats = achats.filter(achat => {
    const s = achatSearch.toLowerCase();
    const numeroAchat = String(achat.numeroAchat || achat.id || '').toLowerCase();
    const reference = String(achat.reference || achat.id || '').toLowerCase();
    const fournisseurNom = formatFournisseur(achat).toLowerCase();
    const dateAchat = String(achat.dateAchat || '').toLowerCase();
    
    return numeroAchat.includes(s) || fournisseurNom.includes(s) || 
           dateAchat.includes(s) || reference.includes(s);
  });

  const filteredBeneficiaires = beneficiaires.filter(b => {
    const s = beneficiaireSearch.toLowerCase();
    return (b.nom?.toLowerCase().includes(s)) || (b.prenom?.toLowerCase().includes(s)) ||
           (b.matricule?.toLowerCase().includes(s)) || (b.email?.toLowerCase().includes(s));
  });

  // === GESTION SÉLECTION ===
  const selectMaterielForPrix = (prix, materiel) => {
    setSelectedMateriels(prev => {
      // Si déjà sélectionné → désélectionner (toggle)
      if (prev[prix]?.id === materiel.id) {
        const updated = { ...prev };
        delete updated[prix];
        return updated;
      }
      // Sinon → sélectionner
      return { ...prev, [prix]: materiel };
    });
  };

  const clearSelectionForPrix = (prix) => {
    setSelectedMateriels(prev => {
      const updated = { ...prev };
      delete updated[prix];
      return updated;
    });
  };

  const clearAllSelections = () => setSelectedMateriels({});

  // === SOUMISSION ===
// ✅ Fonction utilitaire à définir EN DEHORS de handleSubmit (en haut du composant)
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.scrollTo({ top: 0, behavior: 'smooth' });
  
  setTimeout(() => {
    if (window.scrollY > 0 || document.documentElement.scrollTop > 0) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, 300);
};

// === SOUMISSION ===
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const selectedIds = Object.values(selectedMateriels).map(m => m.id);
  
  if (selectedIds.length === 0) {
    toast.warning('Aucun matériel sélectionné. Voulez-vous continuer sans attribution ?');
  }

  if (!selectedBeneficiaire) {
    toast.warning('Veuillez sélectionner un bénéficiaire');
    return;
  }

  try {
    setLoading(true);
    
    const dto = {
      achatId: selectedAchat.id,
      beneficiaireId: selectedBeneficiaire.id,
      materielIds: selectedIds,
      dateAttribution: dateAttribution,
      observations: observations
    };

    const response = await affecterConfigurationComplete(dto);
    
    if (response.data?.success) {
      // ✅ Sauvegarder les infos pour l'affichage de succès
      setLastAttribution({
        beneficiaire: selectedBeneficiaire,
        achat: selectedAchat,
        materielsCount: selectedIds.length,
        date: dateAttribution
      });
      
      toast.success(response.data.message || 'Attribution effectuée avec succès !');
      
      // Recharger les matériels disponibles
      await loadMaterielsParPrix();
      
      // Réinitialiser sélections
      setSelectedMateriels({});
      setObservations('');
      
      // ✅ Afficher le panneau de succès
      setShowSuccess(true);
      
      // 🚀 APPELER la fonction de scroll (c'était ça qui manquait !)
      scrollToTop();
      
      // Optionnel : masquer automatiquement le panneau après 5 secondes
      // setTimeout(() => setShowSuccess(false), 5000);
    }
  } catch (error) {
    console.error('Erreur attribution:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de l\'attribution');
  } finally {
    setLoading(false);
  }
};
  // === RESET ===
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

  // === STATS ===
  const getSelectedCount = () => Object.keys(selectedMateriels).length;
  const getTotalPrixCount = () => Object.keys(materielsParPrix).length;
  const getSelectedList = () => Object.entries(selectedMateriels).map(([prix, m]) => ({
    prix,
    ...m
  }));

  // === RENDER ===
  return (
<div className="bg-white rounded-xl shadow-lg p-6 w-full">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        
        {/* En-tête */}
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-lg mr-4">
            <FiShoppingCart className="text-indigo-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Affectation Complète</h2>
            <p className="text-gray-600">Sélectionnez librement les matériels à attribuer à un bénéficiaire</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ✅ PANNEAU DE SUCCÈS */}
{showSuccess && lastAttribution && (
  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start animate-fade-in">
    <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
      <FiCheck className="text-green-600 text-xl" />
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-green-800">✓ Attribution réussie !</h4>
      <div className="text-sm text-green-700 mt-1 space-y-1">
        <p>
          <span className="font-medium">Bénéficiaire :</span> {lastAttribution.beneficiaire.nom} {lastAttribution.beneficiaire.prenom}
          {lastAttribution.beneficiaire.matricule && ` • Mat: ${lastAttribution.beneficiaire.matricule}`}
        </p>
        <p>
          <span className="font-medium">Achat :</span> #{lastAttribution.achat.numeroAchat || lastAttribution.achat.id} • {formatFournisseur(lastAttribution.achat)}
        </p>
        <p>
          <span className="font-medium">Matériels attribués :</span> {lastAttribution.materielsCount} • <span className="font-medium">Date :</span> {lastAttribution.date}
        </p>
      </div>
      
      {/* Boutons d'action post-succès */}
      <div className="flex gap-3 mt-4">
        <button 
          type="button"
          onClick={() => {
            setShowSuccess(false);
            resetForm(); // Tout réinitialiser pour une nouvelle attribution
          }} 
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
        >
          Nouvelle attribution
        </button>
        <button 
          type="button"
          onClick={() => {
            setShowSuccess(false);
            // Garder achat et bénéficiaire pour enchaîner les attributions
            clearAllSelections();
            setObservations('');
          }} 
          className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium transition-colors"
        >
          Continuer avec les mêmes sélections
        </button>
        <button 
          type="button"
          onClick={() => setShowSuccess(false)} 
          className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Fermer
        </button>
      </div>
    </div>
    <button 
      type="button"
      onClick={() => setShowSuccess(false)} 
      className="text-gray-400 hover:text-gray-600 ml-2"
    >
      <FiX size={20} />
    </button>
  </div>
)}
          {/* 1. Sélection Achat */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
              Sélectionnez un achat
            </h3>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowAchatDropdown(!showAchatDropdown); setShowBeneficiaireDropdown(false); }}
                className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                  selectedAchat ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <FiShoppingCart className="mr-3 text-indigo-500" />
                  <div>
                    {selectedAchat ? (
                      <>
                        <div className="font-medium text-gray-800">{selectedAchat.reference || selectedAchat.id}</div>
                        <div className="text-sm text-gray-600">{formatFournisseur(selectedAchat)} • {selectedAchat.dateAchat || 'N/A'}</div>
                      </>
                    ) : (
                      <span className="text-gray-500">Cliquez pour sélectionner un achat...</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {selectedAchat && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); clearAchatSelection(); }} 
                      className="mr-2 text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
                  )}
                  <FiChevronDown className={`transition-transform ${showAchatDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showAchatDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  <div className="p-3 border-b">
                    <input type="text" value={achatSearch} onChange={(e) => setAchatSearch(e.target.value)}
                      placeholder="Rechercher un achat..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                  <div className="py-2">
                    {loadingAchats ? (
                      <div className="p-4 text-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 mx-auto"/><p className="mt-2 text-sm text-gray-500">Chargement...</p></div>
                    ) : filteredAchats.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">Aucun achat trouvé</div>
                    ) : filteredAchats.map(achat => (
                      <div key={achat.id} onClick={() => { setSelectedAchat(achat); setShowAchatDropdown(false); setAchatSearch(''); }}
                        className={`px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0 ${selectedAchat?.id === achat.id ? 'bg-indigo-50' : ''}`}>
                        <div className="font-medium text-gray-800">{achat.reference || achat.id}</div>
                        <div className="text-sm text-gray-600 flex justify-between mt-1">
                          <span>{formatFournisseur(achat)}</span><span>{achat.dateAchat || 'N/A'}</span>
                        </div>
                        {achat.totalHT && <div className="text-xs text-gray-500 mt-1">Total: {achat.totalHT} DH HT</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedAchat && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" />
                  <div>
                    <span className="font-medium text-green-800">Achat sélectionné:</span>
                    <div className="text-sm text-green-700">
                      #{selectedAchat.numeroAchat || selectedAchat.id} • {formatFournisseur(selectedAchat)}
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => setShowAchatDropdown(true)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Changer</button>
              </div>
            )}
          </div>

          {/* 2. Sélection Matériels (LIBRE) */}
          {selectedAchat && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                  Sélectionnez les matériels <span className="text-sm font-normal text-gray-500 ml-2">(par prix)</span>
                </h3>
                {getSelectedCount() > 0 && (
                  <button type="button" onClick={clearAllSelections} 
                    className="text-sm text-red-600 hover:text-red-800 flex items-center">
                    <FiTrash2 className="mr-1" size={14}/> Tout désélectionner
                  </button>
                )}
              </div>

              {loadingMateriels ? (
                <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 mx-auto"/><p className="mt-2 text-sm text-gray-500">Chargement...</p></div>
              ) : Object.keys(materielsParPrix).length === 0 ? (
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-yellow-800 font-medium">Aucun matériel disponible pour cet achat</p>
                  <p className="text-sm text-yellow-700 mt-2">Tous les matériels ont déjà été attribués</p>
                </div>
              ) : (
                <>
<div className="space-y-6">
  {Object.entries(materielsParPrix).map(([prixKey, prixData]) => {
    // prixData contient maintenant: { prixValue, designation, materiels }
    const { prixValue, designation, materiels } = prixData || {};
    
    return (
      <div key={prixKey} className="border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 pb-3 border-b">
          <div className="flex items-start gap-3">
            {/* Badge prix */}
            <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-700 font-bold text-sm">
             
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Titre avec désignation si disponible */}
              {designation ? (
                <h4 className="font-semibold text-gray-800 truncate" title={designation}>
                  {designation}
                </h4>
              ) : (
                <h4 className="font-semibold text-gray-800">Prix: {prixValue}</h4>
              )}
              
              {/* Nombre de matériels */}
              <p className="text-sm text-gray-500">
                {materiels?.length || 0} matériel(s) disponible(s)
              </p>
            </div>
          </div>
          
          {/* Badge sélection */}
          {selectedMateriels[prixKey] && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm text-green-600 font-medium flex items-center">
                <FiCheck className="mr-1" size={14}/> Sélectionné
              </span>
              <button 
                type="button" 
                onClick={() => clearSelectionForPrix(prixKey)} 
                className="text-xs text-red-500 hover:text-red-700 flex items-center"
              >
                <FiX size={14}/> Retirer
              </button>
            </div>
          )}
        </div>

        {/* Grille des matériels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(materiels || []).map(materiel => {
            const isSelected = selectedMateriels[prixKey]?.id === materiel.id;
            
            return (
              <div 
                key={materiel.id} 
                onClick={() => selectMaterielForPrix(prixKey, materiel)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                    : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start">
                  <div className={`mt-1 w-4 h-4 border rounded flex items-center justify-center mr-3 flex-shrink-0 ${
                    isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                  }`}>
                    {isSelected && <FiCheck className="text-white" size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {` (S/N: ${materiel.numeroSerie})`|| `Matériel sans S/N: ${materiel.id}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      {materiel.numeroSerie && <div>S/N: {materiel.numeroSerie}</div>}
                       
                      {materiel.marque?.nom && <div>Marque: {materiel.marque.nom}</div>}
                      {materiel.type?.designation && <div>Modèle: {materiel.type.designation}</div>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  })}
</div>

                  {/* Résumé sélection */}
                  <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <span className="font-medium text-indigo-800">Matériels sélectionnés:</span>
                        <div className="text-2xl font-bold text-indigo-700 mt-1">{getSelectedCount()}</div>
                        <p className="text-sm text-indigo-600 mt-1">
                          {getSelectedCount() === 0 
                            ? 'Aucun matériel sélectionné (optionnel)' 
                            : `${getSelectedCount()} matériel(s) prêt(s) à être attribué(s)`}
                        </p>
                      </div>
                      {getSelectedCount() > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {getSelectedList().map(({prix, numeroSerie, id}) => (
<span className="px-2 py-1 bg-white border border-indigo-200 rounded text-xs text-indigo-700">
  {(typeof prix === 'object' ? (prix.numeroPrix || prix.id) : prix)}: {numeroSerie?.slice(0, 12) || `#${id}`}
</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 3. Sélection Bénéficiaire */}
          {selectedAchat && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                Sélectionnez un bénéficiaire
              </h3>
              
              <div className="relative">
                <button type="button" onClick={() => { setShowBeneficiaireDropdown(!showBeneficiaireDropdown); setShowAchatDropdown(false); }}
                  className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                    selectedBeneficiaire ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                  }`}>
                  <div className="flex items-center">
                    <FiUser className="mr-3 text-indigo-500" />
                    <div>
                      {selectedBeneficiaire ? (
                        <>
                          <div className="font-medium text-gray-800">{selectedBeneficiaire.nom} {selectedBeneficiaire.prenom}</div>
                          <div className="text-sm text-gray-600">{selectedBeneficiaire.matricule && `${selectedBeneficiaire.matricule} • `}{selectedBeneficiaire.departement?.nom || selectedBeneficiaire.service?.nom || 'N/A'}</div>
                        </>
                      ) : (
                        <span className="text-gray-500">Cliquez pour sélectionner un bénéficiaire...</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {selectedBeneficiaire && <button type="button" onClick={(e) => { e.stopPropagation(); clearBeneficiaireSelection(); }} className="mr-2 text-gray-400 hover:text-gray-600"><FiX size={18} /></button>}
                    <FiChevronDown className={`transition-transform ${showBeneficiaireDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showBeneficiaireDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    <div className="p-3 border-b">
                      <input type="text" value={beneficiaireSearch} onChange={(e) => setBeneficiaireSearch(e.target.value)}
                        placeholder="Rechercher un bénéficiaire..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                    <div className="py-2">
                      {loadingBeneficiaires ? (
                        <div className="p-4 text-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 mx-auto"/><p className="mt-2 text-sm text-gray-500">Chargement...</p></div>
                      ) : filteredBeneficiaires.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">Aucun bénéficiaire trouvé</div>
                      ) : filteredBeneficiaires.map(b => (
                        <div key={b.id} onClick={() => { setSelectedBeneficiaire(b); setShowBeneficiaireDropdown(false); setBeneficiaireSearch(''); }}
                          className={`px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0 ${selectedBeneficiaire?.id === b.id ? 'bg-indigo-50' : ''}`}>
                          <div className="font-medium text-gray-800">{b.nom} {b.prenom}</div>
                          <div className="text-sm text-gray-600 flex justify-between mt-1">
                            <span>{b.matricule ? `Mat: ${b.matricule}` : 'Sans matricule'}</span>
                            <span>{b.departement?.nom || b.service?.nom || 'N/A'}</span>
                          </div>
                          {b.email && <div className="text-xs text-gray-500 mt-1 truncate">{b.email}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedBeneficiaire && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <FiCheck className="text-green-500 mr-2" />
                    <div>
                      <span className="font-medium text-green-800">Bénéficiaire sélectionné:</span>
                      <div className="text-sm text-green-700">{selectedBeneficiaire.nom} {selectedBeneficiaire.prenom} {selectedBeneficiaire.matricule && `• ${selectedBeneficiaire.matricule}`}</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowBeneficiaireDropdown(true)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Changer</button>
                </div>
              )}
            </div>
          )}

          {/* 4. Date & Observations */}
          {selectedAchat && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">4</span>
                  Date d'attribution
                </h3>
                <input type="date" value={dateAttribution} onChange={(e) => setDateAttribution(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">5</span>
                  Observations
                </h3>
                <textarea value={observations} onChange={(e) => setObservations(e.target.value)}
                  placeholder="Notes optionnelles..." rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          {selectedAchat && selectedBeneficiaire && (
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button type="button" onClick={resetForm} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium" disabled={loading}>
                Annuler
              </button>
              <button type="submit" disabled={loading || !selectedBeneficiaire}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                {loading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div> Attribution...</>
                ) : (
                  <><FiCheck className="mr-2" />Attribuer {getSelectedCount() > 0 ? `${getSelectedCount()} matériel(s)` : 'sans matériel'}</>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Info bulle aide */}
      {selectedAchat && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start text-sm text-blue-800">
          <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
          <p>
            <strong>Astuce :</strong> Vous pouvez sélectionner 0, 1 ou plusieurs matériels. 
            La sélection n'est pas obligatoire pour chaque prix. Cliquez à nouveau sur un matériel sélectionné pour le désélectionner.
          </p>
        </div>
      )}
    </div>
  );
};

export default AffectationComplete;