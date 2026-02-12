import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiX, 
  FiSave,
  FiDollarSign,
  FiFileText,
  FiCalendar,
  FiUsers,
  FiAlertTriangle,
  FiBox,
  FiLoader,
  FiChevronDown,
  FiCheck
} from 'react-icons/fi';
import { getAllFournisseurs } from '../../services/fournisseurService';
import { createAchat } from '../../services/achatService';

const AddAchat = ({ onClose, onSuccess }) => {
  const [creationMode, setCreationMode] = useState('withoutPrix'); // 'withPrix' ou 'withoutPrix'
  const [formData, setFormData] = useState({
    reference: '',
    date: '',
    tauxTva: '20',
    type: 'MARCHE',
    observations: '',
    fournisseurId: '',
    prixList: []
  });
  
  const [prixForm, setPrixForm] = useState({
    numeroPrix: '',
    designation: '',
    unite: 'U',
    quantite: 1,
    prixUnitaireHT: 0
  });
  
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loadingFournisseurs, setLoadingFournisseurs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Charger les fournisseurs au montage
  useEffect(() => {
    loadFournisseurs();
    // Set default date to today
    setFormData(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const loadFournisseurs = async () => {
    try {
      setLoadingFournisseurs(true);
      const response = await getAllFournisseurs();
const data = response.data;
      console.log('Fournisseurs chargés:', data);
      setFournisseurs(data);
    } catch (err) {
      console.error('Erreur lors du chargement des fournisseurs:', err);
      setError('Erreur lors du chargement de la liste des fournisseurs.');
    } finally {
      setLoadingFournisseurs(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrixInputChange = (e) => {
    const { name, value } = e.target;
    setPrixForm(prev => ({
      ...prev,
      [name]: name === 'quantite' || name === 'prixUnitaireHT' ? parseFloat(value) || 0 : value
    }));
  };

  const addPrixToList = () => {
    const { numeroPrix, designation, quantite, prixUnitaireHT, unite } = prixForm;

    if (!numeroPrix || !designation || !quantite || !prixUnitaireHT) {
      setError('Veuillez remplir tous les champs du prix');
      return;
    }

    if (quantite <= 0) {
      setError('La quantité doit être supérieure à 0');
      return;
    }

    if (prixUnitaireHT <= 0) {
      setError('Le prix unitaire doit être supérieur à 0');
      return;
    }

    const newPrix = {
      numeroPrix,
      designation,
      unite: unite || "U",
      quantite: parseInt(quantite),
      prixUnitaireHT: parseFloat(prixUnitaireHT)
    };

    setFormData(prev => ({
      ...prev,
      prixList: [...prev.prixList, newPrix]
    }));

    // Réinitialiser le formulaire de prix
    setPrixForm({
      numeroPrix: '',
      designation: '',
      unite: 'U',
      quantite: 1,
      prixUnitaireHT: 0
    });
    setError(null);
  };

  const removePrixFromList = (index) => {
    setFormData(prev => ({
      ...prev,
      prixList: prev.prixList.filter((_, i) => i !== index)
    }));
  };

  const calculatePrixTotalHT = (prix) => {
    const qte = Number(prix?.quantite ?? 0);
    const pu = Number(prix?.prixUnitaireHT ?? 0);
    return qte * pu;
  };

  const calculateMontantTotal = () => {
    return formData.prixList.reduce(
      (total, prix) => total + calculatePrixTotalHT(prix),
      0
    );
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!formData.reference || !formData.fournisseurId) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Si mode création SANS prix, autoriser la création même sans prixList
      if (creationMode === 'withPrix' && formData.prixList.length === 0) {
        setError('Veuillez ajouter au moins un prix en mode "Avec prix"');
        return;
      }

      const achatData = {
        ...formData,
        tauxTva: parseFloat(formData.tauxTva),
        fournisseurId: parseInt(formData.fournisseurId),
        // Si mode sans prix, envoyer un tableau vide
        prixList: creationMode === 'withPrix' ? formData.prixList : []
      };

      const response = await createAchat(achatData);
      
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Fermer automatiquement après 2 secondes
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  return (
   <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
      <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Créer un Nouvel Achat</h3>
          <p className="text-gray-600 mt-1">Remplissez les informations de l'achat</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
        {success ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-green-600 text-3xl" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">Achat créé avec succès !</h4>
            <p className="text-gray-600 mb-6">
              {creationMode === 'withPrix' 
                ? 'L\'achat et les matériels ont été générés automatiquement.' 
                : 'Vous pouvez maintenant ajouter des prix à cet achat.'}
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              Fermeture automatique dans 2 secondes...
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Sélection du mode de création */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                <FiFileText className="mr-2 text-blue-500" /> Mode de création
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCreationMode('withPrix')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    creationMode === 'withPrix' 
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${
                      creationMode === 'withPrix' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <FiDollarSign size={24} />
                    </div>
                    <div>
                      <h5 className="font-bold text-lg">Avec prix</h5>
                      <p className="text-sm text-gray-600">Créer l'achat avec les prix immédiatement</p>
                    </div>
                  </div>
                  {/* <ul className="text-sm text-gray-600 space-y-1 ml-1">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                      Génération automatique des matériels
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                      Calcul instantané du montant total
                    </li>
                  </ul> */}
                </button>
                
                <button
                  type="button"
                  onClick={() => setCreationMode('withoutPrix')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    creationMode === 'withoutPrix' 
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-md' 
                      : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${
                      creationMode === 'withoutPrix' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <FiPlus size={24} />
                    </div>
                    <div>
                      <h5 className="font-bold text-lg">Sans prix</h5>
                      <p className="text-sm text-gray-600">Créer l'achat vide, ajouter les prix plus tard</p>
                    </div>
                  </div>
                  {/* <ul className="text-sm text-gray-600 space-y-1 ml-1">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      Flexibilité pour ajouter les prix plus tard
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      Importation Excel possible ultérieurement
                    </li>
                  </ul> */}
                </button>
              </div>
            </div>

            {/* Section Informations générales */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-gray-800 mb-6 flex items-center">
                <FiFileText className="mr-2 text-blue-600" /> Informations générales
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Référence * <span className="text-xs text-gray-500 font-normal">(Unique)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleInputChange}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <FiCalendar className="absolute right-4 top-3.5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type *
                  </label>
                  <div className="relative">
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      required
                    >
                      <option value="MARCHE">Marché</option>
                      <option value="BON_COMMANDE">Bon de Commande</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                    <FiChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Taux TVA (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="tauxTva"
                      value={formData.tauxTva}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-3.5 text-gray-500">%</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fournisseur * <span className="text-xs text-gray-500 font-normal">(Sélectionnez dans la liste)</span>
                  </label>
                  <div className="relative">
                    {loadingFournisseurs ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
                        <FiLoader className="animate-spin mr-3 text-blue-500" />
                        <span className="text-gray-600">Chargement des fournisseurs...</span>
                      </div>
                    ) : (
                      <select
                        name="fournisseurId"
                        value={formData.fournisseurId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
                        required
                      >
                        <option value="">-- Sélectionnez un fournisseur --</option>
                        {Array.isArray(fournisseurs) && fournisseurs.length > 0 ? (
                          fournisseurs.map((fournisseur) => (
                            <option key={fournisseur.id} value={fournisseur.id}>
                              {fournisseur.code} - {fournisseur.nom}
                              {fournisseur.ville && ` (${fournisseur.ville})`}
                              {fournisseur.telephone && ` - ${fournisseur.telephone}`}
                            </option>
                          ))
                        ) : (
                          <option disabled>Aucun fournisseur disponible</option>
                        )}
                      </select>
                    )}
                    <FiUsers className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                  </div>
                  
                  {formData.fournisseurId && Array.isArray(fournisseurs) && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <span className="font-medium">Fournisseur sélectionné :</span>{' '}
                        {getFournisseurNameById(formData.fournisseurId)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observations
                  </label>
                  <textarea
                    name="observations"
                    value={formData.observations}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notes supplémentaires, détails particuliers..."
                  />
                </div>
              </div>
            </div>

            {/* Section Prix - UNIQUEMENT en mode "withPrix" */}
            {creationMode === 'withPrix' && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <h4 className="font-bold text-gray-800 mb-6 flex items-center">
                  <FiDollarSign className="mr-2 text-green-600" /> Prix et Matériel
                </h4>
                
                <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-xl">
                  <div className="flex items-center">
                    <FiAlertTriangle className="text-green-600 mr-2" />
                    <p className="text-sm text-green-800">
                      Chaque prix ajouté générera automatiquement les matériels correspondants
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      N° Prix *
                    </label>
                    <input
                      type="text"
                      name="numeroPrix"
                      value={prixForm.numeroPrix}
                      onChange={handlePrixInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="P001"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Désignation *
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={prixForm.designation}
                      onChange={handlePrixInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Description du produit"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unité
                    </label>
                    <div className="relative">
                      <select
                        name="unite"
                        value={prixForm.unite}
                        onChange={handlePrixInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                      >
                        <option value="U">Unité (U)</option>
                        <option value="LOT">Lot</option>
                        <option value="M">Mètre (M)</option>
                        <option value="KG">Kilogramme (KG)</option>
                        <option value="L">Litre (L)</option>
                        <option value="M2">Mètre carré (M²)</option>
                      </select>
                      <FiBox className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantité *
                      </label>
                      <input
                        type="number"
                        name="quantite"
                        value={prixForm.quantite}
                        onChange={handlePrixInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        min="1"
                        step="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prix HT *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="prixUnitaireHT"
                          value={prixForm.prixUnitaireHT}
                          onChange={handlePrixInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pl-12"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          required
                        />
                        <span className="absolute left-4 top-3.5 text-gray-500 font-medium">DH</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addPrixToList}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center mb-6"
                >
                  <FiPlus className="mr-2" /> Ajouter ce prix
                </button>

                {/* Liste des prix ajoutés */}
                {formData.prixList.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <FiDollarSign className="mr-2 text-green-500" />
                      Prix ajoutés ({formData.prixList.length})
                    </h5>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {formData.prixList.map((prix, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center mb-2">
                                <span className="font-bold text-blue-600 mr-3">{prix.numeroPrix}</span>
                                <span className="font-medium text-gray-800">{prix.designation}</span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center">
                                  <span className="bg-gray-100 px-2 py-1 rounded mr-2">{prix.quantite} {prix.unite}</span>
                                  <span className="text-green-600 font-medium">
                                    × {prix.prixUnitaireHT.toFixed(2)} DH
                                  </span>
                                </div>
                                <div className="text-green-700 font-bold">
                                  Total: {calculatePrixTotalHT(prix).toFixed(2)} DH
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePrixFromList(idx)}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"
                              title="Supprimer"
                            >
                              <FiX size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Message pour mode sans prix */}
            {creationMode === 'withoutPrix' && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <FiAlertTriangle className="text-yellow-600" size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-yellow-800 mb-2">
                      Achat sans prix
                    </h3>
                    <div className="text-yellow-700 space-y-2">
                      <p>
                        Vous créezd un achat sans prix. Vous pourrez ajouter les prix plus tard via :
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Importation Excel (format standard)</li>
                        <li>Ajout manuel via formulaire</li>
                        <li>Édition de l'achat</li>
                      </ul>
                      <p className="pt-2 border-t border-yellow-200 mt-2">
                        <span className="font-semibold">Les matériels seront générés automatiquement</span> lorsque vous ajouterez les prix.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Résumé et validation */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4">Résumé</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Mode</div>
                  <div className="text-lg font-bold">
                    {creationMode === 'withPrix' ? 'Avec prix' : 'Sans prix'}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Nombre de prix</div>
                  <div className="text-lg font-bold">{formData.prixList.length}</div>
                </div>
                
                {creationMode === 'withPrix' && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Montant Total HT</div>
                    <div className="text-2xl font-bold text-green-600">
                      {calculateMontantTotal().toFixed(2)} DH
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <div className="flex items-center">
                    <FiAlertTriangle className="mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  disabled={loading}
                >
                  Annuler
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Créer l'achat
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddAchat;