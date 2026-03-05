import React, { useState, useEffect } from 'react';
import {
  FiSave, FiCheck, FiX, FiSearch, FiPackage, FiHash,
  FiUser, FiChevronDown, FiChevronUp, FiAlertCircle
} from 'react-icons/fi';
import { getAllAchats } from '../../services/achatService';
import { getAllBeneficiaires } from '../../services/beneficiareService';
import { 
  getMaterielsByAchatAndBeneficiaireWithSerial,
  updateNumerosInventaireBatch
} from '../../services/materialService';
import { toast } from 'react-toastify';

const PreparationInventaireSimple = ({ onComplete }) => {
  // === ÉTATS ===
  const [achats, setAchats] = useState([]);
  const [beneficiaires, setBeneficiaires] = useState([]);
  
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [showBenefDropdown, setShowBenefDropdown] = useState(false);
  const [searchAchat, setSearchAchat] = useState('');
  const [searchBenef, setSearchBenef] = useState('');
  
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Édition des numéros d'inventaire : key = materiel.id
  const [inventaires, setInventaires] = useState({});

  // === CHARGEMENT INITIAL ===
  useEffect(() => {
    Promise.all([getAllAchats(), getAllBeneficiaires()])
      .then(([achatsRes, benefRes]) => {
        setAchats(achatsRes.data?.filter(a => a.statut !== 'ANNULE') || []);
        setBeneficiaires(benefRes.data || []);
      })
      .catch(() => toast.error('Erreur chargement des données'));
  }, []);

  // === FILTRES ===
  const filteredAchats = achats.filter(a => {
    const s = searchAchat.toLowerCase();
    return a.reference?.toLowerCase().includes(s) || 
           a.fournisseur?.nom?.toLowerCase().includes(s);
  });

  const filteredBeneficiaires = beneficiaires.filter(b => {
    const s = searchBenef.toLowerCase();
    return b.nom?.toLowerCase().includes(s) || 
           b.prenom?.toLowerCase().includes(s) ||
           b.matricule?.toLowerCase().includes(s);
  });

  // === SÉLECTION ACHAT ===
  const handleSelectAchat = (achat) => {
    setSelectedAchat(achat);
    setSelectedBeneficiaire(null);
    setMateriels([]);
    setInventaires({});
    setShowAchatDropdown(false);
    setSearchAchat('');
  };

  // === SÉLECTION BÉNÉFICIAIRE + CHARGEMENT MATÉRIELS ===
  const handleSelectBeneficiaire = async (beneficiaire) => {
    setSelectedBeneficiaire(beneficiaire);
    setShowBenefDropdown(false);
    setSearchBenef('');
    setMateriels([]);
    setInventaires({});
    
    if (!selectedAchat) return;
    
    try {
      setLoading(true);
      const response = await getMaterielsByAchatAndBeneficiaireWithSerial(
        selectedAchat.id, 
        beneficiaire.id
      );
      
      const data = response.data || [];
      setMateriels(data);
      
      // Pré-remplir les valeurs existantes
      const initial = {};
      data.forEach(m => {
        if (m.numeroInventaire) {
          initial[m.id] = m.numeroInventaire;
        }
      });
      setInventaires(initial);
      
      toast.success(`${data.length} matériel(s) chargé(s)`);
    } catch (error) {
      toast.error('Erreur chargement des matériels');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // === GESTION ÉDITION N° INVENTAIRE ===
  const handleInventaireChange = (materielId, value) => {
    setInventaires(prev => ({
      ...prev,
      [materielId]: value.trim().toUpperCase()
    }));
  };

  // === ENREGISTREMENT ===
  const handleSave = async () => {
    if (!selectedAchat || !selectedBeneficiaire) {
      toast.warning('Sélectionnez un achat et un bénéficiaire');
      return;
    }

    // Filtrer uniquement les modifications (nouvelles ou changées)
    const updates = materiels
      .map(m => {
        const newVal = inventaires[m.id]?.trim();
        const oldVal = m.numeroInventaire?.trim();
        // Inclure si : nouvelle valeur ET (pas d'ancienne OU différente)
        if (newVal && (!oldVal || newVal !== oldVal)) {
          return { numeroSerie: m.numeroSerie, numeroInventaire: newVal };
        }
        return null;
      })
      .filter(Boolean);

    if (updates.length === 0) {
      toast.info('Aucune modification à enregistrer');
      return;
    }

    try {
      setSaving(true);
      const response = await updateNumerosInventaireBatch(
        selectedAchat.id, 
        selectedBeneficiaire.id, 
        updates
      );
      
      const result = response.data;
      const updated = result?.updatedCount ?? result?.length ?? updates.length;
      
      toast.success(`${updated} numéro(s) d'inventaire mis à jour`);
      
      // Recharger pour afficher l'état à jour
      await handleSelectBeneficiaire(selectedBeneficiaire);
      
      onComplete?.();
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur lors de l\'enregistrement';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // === RÉINITIALISATION ===
  const handleReset = () => {
    setSelectedAchat(null);
    setSelectedBeneficiaire(null);
    setMateriels([]);
    setInventaires({});
  };

  // === FORMATAGE ===
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : '';

  // === STATS ===
  const stats = {
    total: materiels.length,
    withInventaire: materiels.filter(m => inventaires[m.id]?.trim()).length,
    modified: materiels.filter(m => {
      const oldVal = m.numeroInventaire?.trim();
      const newVal = inventaires[m.id]?.trim();
      return newVal && newVal !== oldVal;
    }).length
  };

  // === RENDER ===
  return (
<div className="bg-white rounded-xl shadow-lg p-6 w-full">
      
      {/* En-tête */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiHash className="mr-2 text-indigo-600" size={24} />
          Attribution des Numéros d'Inventaire
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Sélectionnez un achat et un bénéficiaire pour gérer les numéros d'inventaire
        </p>
      </div>

      {/* Étape 1 : Sélection Achat */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="bg-indigo-100 text-indigo-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs inline-flex">1</span>
          Achat
        </label>
        
        {!selectedAchat ? (
          <div className="relative">
            <button
              onClick={() => setShowAchatDropdown(!showAchatDropdown)}
              className="w-full p-3 border border-gray-300 rounded-lg text-left flex justify-between hover:border-indigo-400 bg-white"
            >
              <span className="text-gray-500">Sélectionner un achat...</span>
              <FiChevronDown className={`transition-transform ${showAchatDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showAchatDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b sticky top-0 bg-white">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchAchat}
                      onChange={(e) => setSearchAchat(e.target.value)}
                      placeholder="Rechercher..."
                      className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                    />
                    <FiSearch className="absolute left-2.5 top-2 text-gray-400" size={14} />
                  </div>
                </div>
                <div className="py-1">
                  {filteredAchats.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 text-sm">Aucun achat trouvé</div>
                  ) : (
                    filteredAchats.map(achat => (
                      <button
                        key={achat.id}
                        onClick={() => handleSelectAchat(achat)}
                        className="w-full px-3 py-2 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 text-sm"
                      >
                        <div className="font-medium text-gray-800">{achat.reference}</div>
                        <div className="text-xs text-gray-500">
                          {achat.fournisseur?.nom} • {formatDate(achat.date)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex justify-between items-center">
            <div>
              <span className="font-medium text-gray-800">{selectedAchat.reference}</span>
              <span className="ml-2 text-xs text-gray-600">{selectedAchat.fournisseur?.nom}</span>
            </div>
            <button onClick={handleReset} className="text-gray-400 hover:text-gray-600">
              <FiX size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Étape 2 : Sélection Bénéficiaire (si achat sélectionné) */}
      {selectedAchat && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs inline-flex">2</span>
            Bénéficiaire
          </label>
          
          {!selectedBeneficiaire ? (
            <div className="relative">
              <button
                onClick={() => setShowBenefDropdown(!showBenefDropdown)}
                className="w-full p-3 border border-gray-300 rounded-lg text-left flex justify-between hover:border-green-400 bg-white"
              >
                <span className="text-gray-500">Sélectionner un bénéficiaire...</span>
                <FiChevronDown className={`transition-transform ${showBenefDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showBenefDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b sticky top-0 bg-white">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchBenef}
                        onChange={(e) => setSearchBenef(e.target.value)}
                        placeholder="Nom, prénom ou matricule..."
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                      />
                      <FiSearch className="absolute left-2.5 top-2 text-gray-400" size={14} />
                    </div>
                  </div>
                  <div className="py-1">
                    {filteredBeneficiaires.length === 0 ? (
                      <div className="p-3 text-center text-gray-500 text-sm">Aucun bénéficiaire trouvé</div>
                    ) : (
                      filteredBeneficiaires.map(benef => (
                        <button
                          key={benef.id}
                          onClick={() => handleSelectBeneficiaire(benef)}
                          className="w-full px-3 py-2 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0 text-sm"
                        >
                          <div className="font-medium text-gray-800">
                            {benef.nom} {benef.prenom}
                          </div>
                          <div className="text-xs text-gray-500">
                            {benef.matricule && `Mat: ${benef.matricule} • `}
                            {benef.departement?.nom || benef.service?.nom || 'N/A'}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-800">
                  {selectedBeneficiaire.nom} {selectedBeneficiaire.prenom}
                </span>
                {selectedBeneficiaire.matricule && (
                  <span className="ml-2 text-xs text-gray-600">Mat: {selectedBeneficiaire.matricule}</span>
                )}
              </div>
              <button 
                onClick={() => {
                  setSelectedBeneficiaire(null);
                  setMateriels([]);
                  setInventaires({});
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Liste des Matériels (si bénéficiaire sélectionné) */}
      {selectedBeneficiaire && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">
              Matériels avec N° Série ({stats.total})
            </h3>
            {stats.total > 0 && (
              <span className="text-xs text-gray-500">
                {stats.withInventaire} avec inventaire • {stats.modified} modifié(s)
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500"></div>
            </div>
          ) : materiels.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiAlertCircle className="mx-auto text-3xl text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">
                Aucun matériel avec numéro de série trouvé pour ce bénéficiaire dans cet achat
              </p>
            </div>
          ) : (
            <>
              {/* Tableau des matériels */}
              <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2.5 px-3 font-medium text-gray-600">N° Série</th>
                      <th className="text-left py-2.5 px-3 font-medium text-gray-600">Nature</th>
                      <th className="text-left py-2.5 px-3 font-medium text-gray-600">Désignation</th>
                      <th className="text-left py-2.5 px-3 font-medium text-gray-600">
                        N° d'Inventaire <span className="text-red-500">*</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materiels.map(materiel => {
                      const oldValue = materiel.numeroInventaire?.trim() || '';
                      const newValue = inventaires[materiel.id]?.trim() || '';
                      const isModified = newValue && newValue !== oldValue;
                      const hasValue = newValue !== '';
                      
                      return (
                        <tr key={materiel.id} className={`hover:bg-gray-50 ${isModified ? 'bg-yellow-50' : ''}`}>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {materiel.numeroSerie}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-700">
                            {materiel.prix?.nature || materiel.type?.designation || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-gray-700">
                            {materiel.prix?.designation || materiel.marque || '-'}
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={inventaires[materiel.id] ?? materiel.numeroInventaire ?? ''}
                              onChange={(e) => handleInventaireChange(materiel.id, e.target.value)}
                              placeholder="Saisir N° Inventaire"
                              className={`w-full px-3 py-1.5 border rounded text-sm font-mono focus:outline-none focus:ring-2 transition-colors ${
                                isModified 
                                  ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-500' 
                                  : hasValue
                                    ? 'border-green-300 bg-green-50 focus:ring-green-500'
                                    : 'border-gray-300 focus:ring-indigo-500'
                              }`}
                            />
                            {/* Indicateurs visuels */}
                            <div className="flex items-center gap-1 mt-1">
                              {isModified && (
                                <span className="text-xs text-yellow-700 flex items-center">
                                  <FiAlertCircle className="mr-0.5" size={12} /> Modifié
                                </span>
                              )}
                              {!isModified && hasValue && (
                                <span className="text-xs text-green-700 flex items-center">
                                  <FiCheck className="mr-0.5" size={12} /> Attribué
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bouton Enregistrer */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving || stats.modified === 0}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors font-medium"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" size={18} />
                      Enregistrer ({stats.modified})
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer Stats (optionnel) */}
      {selectedBeneficiaire && materiels.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-500">
          <span>📦 {stats.total} matériels</span>
          <span>✅ {stats.withInventaire} avec inventaire</span>
          <span>✏️ {stats.modified} en attente</span>
          <span>🕐 {new Date().toLocaleTimeString('fr-FR')}</span>
        </div>
      )}
    </div>
  );
};

export default PreparationInventaireSimple;