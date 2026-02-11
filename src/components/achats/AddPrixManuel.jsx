import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiTrash, 
  FiDollarSign,
  FiCheck,
  FiX,
  FiBox,
  FiShoppingCart,
  FiChevronDown,
  FiSearch,
  FiUsers,
  FiCalendar
} from 'react-icons/fi';
import { 
  getAllAchats,
  ajouterPrixManuellement 
} from '../../services/achatService';

const AddPrixManuel = ({ onClose, onSuccess }) => {
  const [achats, setAchats] = useState([]);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [prixList, setPrixList] = useState([]);
  const [prixForm, setPrixForm] = useState({
    numeroPrix: '',
    designation: '',
    unite: 'U',
    quantite: 1,
    prixUnitaireHT: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingAchats, setLoadingAchats] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);

  // Charger la liste des achats
  useEffect(() => {
    fetchAchats();
  }, []);

  const fetchAchats = async () => {
    try {
      setLoadingAchats(true);
      const response = await getAllAchats();
      setAchats(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des achats');
      console.error(err);
    } finally {
      setLoadingAchats(false);
    }
  };

  const filteredAchats = achats.filter(achat => {
    return achat.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           achat.fournisseur?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrixForm(prev => ({
      ...prev,
      [name]: name === 'quantite' || name === 'prixUnitaireHT' ? parseFloat(value) || 0 : value
    }));
  };

  const addPrix = () => {
    const { numeroPrix, designation, quantite, prixUnitaireHT } = prixForm;

    if (!selectedAchat) {
      setError('Veuillez sélectionner un achat d\'abord');
      return;
    }

    if (!numeroPrix || !designation || !quantite || !prixUnitaireHT) {
      setError('Veuillez remplir tous les champs obligatoires');
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

    setPrixList(prev => [...prev, { 
      ...prixForm, 
      id: Date.now() + Math.random(),
      quantite: parseInt(quantite),
      prixUnitaireHT: parseFloat(prixUnitaireHT)
    }]);
    
    // Réinitialiser le formulaire
    setPrixForm({
      numeroPrix: '',
      designation: '',
      unite: 'U',
      quantite: 1,
      prixUnitaireHT: 0,
    });
    setError(null);
  };

  const removePrix = (id) => {
    setPrixList(prev => prev.filter(prix => prix.id !== id));
  };

  const calculateTotalHT = (prix) => {
    return (prix.quantite * prix.prixUnitaireHT).toFixed(2);
  };

  const calculateTotalGeneral = () => {
    return prixList.reduce((total, prix) => {
      return total + (prix.quantite * prix.prixUnitaireHT);
    }, 0).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!selectedAchat) {
      setError('Veuillez sélectionner un achat');
      return;
    }

    if (prixList.length === 0) {
      setError('Veuillez ajouter au moins un prix');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Format pour l'API
      const prixData = prixList.map(prix => ({
        numeroPrix: prix.numeroPrix,
        designation: prix.designation,
        unite: prix.unite,
        quantite: prix.quantite,
        prixUnitaireHT: prix.prixUnitaireHT
      }));

      // Utilisation de votre service
      await ajouterPrixManuellement(selectedAchat.id, prixData);

      if (onSuccess) {
        onSuccess(prixList.length, selectedAchat.id);
      }
      
      if (onClose) {
        onClose();
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ajout manuel de prix</h2>
          <p className="text-gray-600">Sélectionnez un achat et ajoutez ses prix</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Étape 1 : Sélection de l'achat */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
          Sélectionnez un achat
        </h3>
        
        <div className="relative">
          <button
            onClick={() => setShowAchatDropdown(!showAchatDropdown)}
            className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
              selectedAchat 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center">
              <FiShoppingCart className="mr-3 text-blue-500" />
              <div>
                {selectedAchat ? (
                  <>
                    <div className="font-medium text-gray-800">{selectedAchat.reference}</div>
                    <div className="text-sm text-gray-600">
                      <FiUsers className="inline mr-1" /> {selectedAchat.fournisseur?.nom} • 
                      <FiCalendar className="inline ml-2 mr-1" /> {new Date(selectedAchat.date).toLocaleDateString('fr-FR')}
                    </div>
                  </>
                ) : (
                  <span className="text-gray-500">Cliquez pour sélectionner un achat...</span>
                )}
              </div>
            </div>
            <FiChevronDown className={`transition-transform ${showAchatDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showAchatDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
              <div className="p-3 border-b">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher une référence ou fournisseur..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>
              
              <div className="py-2">
                {loadingAchats ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Chargement des achats...</p>
                  </div>
                ) : filteredAchats.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Aucun achat trouvé
                  </div>
                ) : (
                  filteredAchats.map(achat => {
                    const prixCount = achat.prixList?.length || 0;
                    const totalHT = (achat.prixList || []).reduce((sum, p) => 
                      sum + (p.quantite * p.prixUnitaireHT), 0
                    ).toFixed(2);
                    
                    return (
                      <div
                        key={achat.id}
                        onClick={() => {
                          setSelectedAchat(achat);
                          setShowAchatDropdown(false);
                          setSearchTerm('');
                        }}
                        className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          selectedAchat?.id === achat.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">{achat.reference}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              <FiUsers className="inline mr-1" size={12} />
                              {achat.fournisseur?.nom}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              prixCount === 0 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {prixCount} prix
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {totalHT} DH
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 flex justify-between">
                          <span>{new Date(achat.date).toLocaleDateString('fr-FR')}</span>
                          <span>{achat.type}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {selectedAchat && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <FiCheck className="text-green-500 mr-2" />
              <div>
                <span className="font-medium text-green-800">Achat sélectionné:</span>
                <div className="text-sm text-green-700">
                  {selectedAchat.reference} • {selectedAchat.fournisseur?.nom} • 
                  {(selectedAchat.prixList || []).length} prix existants
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Étape 2 : Ajout des prix */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
          Ajoutez les prix
        </h3>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
            <FiPlus className="mr-2" /> Nouveau prix
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° Prix *
              </label>
              <input
                type="text"
                name="numeroPrix"
                value={prixForm.numeroPrix}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="P001"
                required
                disabled={!selectedAchat}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Désignation *
              </label>
              <input
                type="text"
                name="designation"
                value={prixForm.designation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description du produit"
                required
                disabled={!selectedAchat}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité
              </label>
              <select
                name="unite"
                value={prixForm.unite}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedAchat}
              >
                <option value="U">Unité (U)</option>
                <option value="LOT">Lot</option>
                <option value="M">Mètre</option>
                <option value="KG">Kilogramme</option>
                <option value="L">Litre</option>
                <option value="M2">Mètre carré</option>
                <option value="H">Heure</option>
                <option value="J">Jour</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité *
                </label>
                <input
                  type="number"
                  name="quantite"
                  value={prixForm.quantite}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="1"
                  required
                  disabled={!selectedAchat}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix HT *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="prixUnitaireHT"
                    value={prixForm.prixUnitaireHT}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                    min="0"
                    step="0.01"
                    required
                    disabled={!selectedAchat}
                  />
                  <span className="absolute left-3 top-2 text-gray-500 font-medium">DH</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <button
            onClick={addPrix}
            disabled={!selectedAchat}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus className="mr-2" /> Ajouter ce prix
          </button>
        </div>

        {/* Liste des prix ajoutés */}
        {prixList.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Prix à ajouter ({prixList.length})
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Prix</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unité</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix HT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total HT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {prixList.map((prix) => (
                    <tr key={prix.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-blue-600">{prix.numeroPrix}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate" title={prix.designation}>
                          {prix.designation}
                        </div>
                      </td>
                      <td className="px-4 py-3">{prix.unite}</td>
                      <td className="px-4 py-3">{prix.quantite}</td>
                      <td className="px-4 py-3">
                        <span className="text-green-600 font-medium">
                          {prix.prixUnitaireHT.toFixed(2)} DH
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-green-700">
                          {calculateTotalHT(prix)} DH
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removePrix(prix.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Supprimer"
                        >
                          <FiTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="5" className="px-4 py-3 text-right font-semibold">
                      Total général HT:
                    </td>
                    <td colSpan="2" className="px-4 py-3">
                      <span className="text-xl font-bold text-green-700">
                        {calculateTotalGeneral()} DH
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div>
          <p className="text-sm text-gray-600">
            {!selectedAchat ? (
              <span className="text-orange-600">Étape 1 : Sélectionnez un achat</span>
            ) : prixList.length === 0 ? (
              <span className="text-orange-600">Étape 2 : Ajoutez au moins un prix</span>
            ) : (
              <span className="text-green-600">
                {prixList.length} prix prêts à être ajoutés à l'achat {selectedAchat.reference}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!selectedAchat || prixList.length === 0 || loading}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <FiCheck className="mr-2" />
                Ajouter {prixList.length} prix
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPrixManuel;