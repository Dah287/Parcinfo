import React, { useState, useEffect } from 'react';
import {
  FiUpload,
  FiDownload,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiPackage,
  FiShoppingCart,
  FiSave,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiTruck,
  FiCalendar
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { getAllAchats, getPrixByAchat } from '../../services/achatService';
import { 
  getMaterielsByPrix,
  preparerMateriels 
} from '../../services/materialService';
import { toast } from 'react-toastify';

const PreparationMateriels = ({ onComplete }) => {
  // États pour la sélection d'achat
  const [achats, setAchats] = useState([]);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [achatSearchTerm, setAchatSearchTerm] = useState('');
  const [loadingAchats, setLoadingAchats] = useState(true);

  // États pour les prix
  const [prixList, setPrixList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [expandedPrix, setExpandedPrix] = useState(null);
  const [materielsData, setMaterielsData] = useState({});
  const [importData, setImportData] = useState({});
  const [importErrors, setImportErrors] = useState({});
  const [showImportPreview, setShowImportPreview] = useState({});

  // Charger la liste des achats au montage
  useEffect(() => {
    loadAchats();
  }, []);

  const loadAchats = async () => {
    try {
      setLoadingAchats(true);
      const response = await getAllAchats();
      setAchats(response.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des achats');
      console.error(error);
    } finally {
      setLoadingAchats(false);
    }
  };

  // Charger les prix d'un achat sélectionné
  const handleAchatSelect = async (achat) => {
    setSelectedAchat(achat);
    setShowAchatDropdown(false);
    setAchatSearchTerm('');

    try {
      setLoading(true);
      const response = await getPrixByAchat(achat.id);
      const prix = response.data || [];
      setPrixList(prix);
      
      // Initialiser les états pour chaque prix
      const initialData = {};
      prix.forEach(p => {
        initialData[p.id] = [];
      });
      setMaterielsData(initialData);
      setImportData(initialData);
      setImportErrors(initialData);
      setShowImportPreview(initialData);
      
      toast.success(`${prix.length} prix chargés pour l'achat ${achat.reference}`);
      
    } catch (error) {
      toast.error('Erreur lors du chargement des prix');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les achats
  const filteredAchats = achats.filter(achat => {
    const searchLower = achatSearchTerm.toLowerCase();
    return (
      achat.reference?.toLowerCase().includes(searchLower) ||
      achat.fournisseur?.nom?.toLowerCase().includes(searchLower)
    );
  });

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Charger les matériels pour un prix
  const loadMaterielsForPrix = async (prixId) => {
    try {
      const response = await getMaterielsByPrix(prixId);
      setMaterielsData(prev => ({
        ...prev,
        [prixId]: response.data || []
      }));
    } catch (error) {
      console.error('Erreur chargement matériels:', error);
      setMaterielsData(prev => ({
        ...prev,
        [prixId]: []
      }));
    }
  };

  const handleExpandPrix = (prixId) => {
    if (expandedPrix === prixId) {
      setExpandedPrix(null);
    } else {
      setExpandedPrix(prixId);
      if (!materielsData[prixId] || materielsData[prixId].length === 0) {
        loadMaterielsForPrix(prixId);
      }
    }
  };

  // Télécharger le modèle Excel
  const downloadTemplate = (prix) => {
    const template = [];
    
    for (let i = 0; i < prix.quantite; i++) {
      template.push({
        'N° Prix': prix.numeroPrix,
        'Désignation': prix.designation,
        'N° Série': '',
        "N° d'Inventaire": '',
        'Marque': prix.marque || '',
        'Modèle': prix.designation || '',
        'Caractéristiques': `${prix.processeur || ''} ${prix.ram || ''} ${prix.disque || ''}`.trim(),
        'Observations': ''
      });
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(template);
    
    const colWidths = [
      { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, 
      { wch: 15 }, { wch: 30 }, { wch: 40 }, { wch: 30 }
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Matériels');
    
    const fileName = `preparation_${prix.numeroPrix}_${prix.designation.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success('Modèle Excel téléchargé');
  };

  // Importer le fichier Excel
  const handleFileImport = (event, prix) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const errors = [];
        const validData = [];

        const seriesMap = new Map();
        const inventaireMap = new Map();

        jsonData.forEach((row, index) => {
          const lineErrors = [];
          const ligneNum = index + 2;
          
          const numeroSerie = row['N° Série']?.toString().trim() || '';
          const numeroInventaire = row["N° d'Inventaire"]?.toString().trim() || '';
          
          if (!numeroSerie && !numeroInventaire) {
            lineErrors.push('Au moins un numéro (série ou inventaire) est requis');
          }

          if (numeroSerie) {
            if (seriesMap.has(numeroSerie)) {
              lineErrors.push(`Numéro de série "${numeroSerie}" en double (ligne ${seriesMap.get(numeroSerie)})`);
            } else {
              seriesMap.set(numeroSerie, ligneNum);
            }
          }

          if (numeroInventaire) {
            if (inventaireMap.has(numeroInventaire)) {
              lineErrors.push(`Numéro d'inventaire "${numeroInventaire}" en double (ligne ${inventaireMap.get(numeroInventaire)})`);
            } else {
              inventaireMap.set(numeroInventaire, ligneNum);
            }
          }

          if (lineErrors.length > 0) {
            errors.push({
              ligne: ligneNum,
              erreurs: lineErrors,
              data: row
            });
          } else {
            validData.push({
              numeroSerie: numeroSerie || null,
              numeroInventaire: numeroInventaire || null,
              observations: row['Observations']?.toString().trim() || null,
              prixId: prix.id
            });
          }
        });

        if (validData.length !== prix.quantite) {
          errors.push({
            ligne: 0,
            erreurs: [`Le nombre de lignes (${validData.length}) ne correspond pas à la quantité attendue (${prix.quantite})`]
          });
        }

        setImportData(prev => ({
          ...prev,
          [prix.id]: validData
        }));
        
        setImportErrors(prev => ({
          ...prev,
          [prix.id]: errors
        }));
        
        setShowImportPreview(prev => ({
          ...prev,
          [prix.id]: true
        }));

        if (errors.length === 0) {
          toast.success(`${validData.length} matériels prêts à être enregistrés`);
        } else {
          toast.warning(`${errors.length} erreur(s) détectée(s)`);
        }

      } catch (error) {
        toast.error('Erreur lors de la lecture du fichier');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    
    event.target.value = null;
  };

  // Enregistrer les matériels préparés
  const savePreparedMaterials = async (prix) => {
    const data = importData[prix.id] || [];
    const errors = importErrors[prix.id] || [];

    if (data.length === 0) {
      toast.error('Aucune donnée à enregistrer');
      return;
    }

    if (errors.length > 0) {
      toast.error('Veuillez corriger les erreurs avant d\'enregistrer');
      return;
    }

    try {
      setProcessing(true);
      
      const response = await preparerMateriels(prix.id, data);
      
      toast.success(`${data.length} matériel(s) préparé(s) avec succès`);
      
      await loadMaterielsForPrix(prix.id);
      
      setShowImportPreview(prev => ({
        ...prev,
        [prix.id]: false
      }));
      
      setImportData(prev => ({
        ...prev,
        [prix.id]: []
      }));
      
      if (onComplete) onComplete();
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setProcessing(false);
    }
  };

  // Compter les matériels préparés
  const getProgress = (prixId, quantite) => {
    const materiels = materielsData[prixId] || [];
    const prepared = materiels.filter(m => m.numeroSerie || m.numeroInventaire).length;
    return { prepared, total: quantite };
  };

  // Annuler l'import
  const cancelImport = (prixId) => {
    setShowImportPreview(prev => ({
      ...prev,
      [prixId]: false
    }));
    setImportData(prev => ({
      ...prev,
      [prixId]: []
    }));
    setImportErrors(prev => ({
      ...prev,
      [prixId]: []
    }));
  };

  // Réinitialiser la sélection
  const resetSelection = () => {
    setSelectedAchat(null);
    setPrixList([]);
    setExpandedPrix(null);
    setMaterielsData({});
    setImportData({});
    setImportErrors({});
    setShowImportPreview({});
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiPackage className="mr-2 text-blue-600" />
          Préparation des matériels
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Sélectionnez un achat, puis saisissez les numéros de série et d'inventaire
        </p>
      </div>

      {/* Étape 1 : Sélection de l'achat */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="bg-blue-100 text-blue-800 w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
          Sélectionner un achat
        </h3>

        {!selectedAchat ? (
          <div className="relative">
            <button
              onClick={() => setShowAchatDropdown(!showAchatDropdown)}
              className="w-full p-4 border border-gray-300 rounded-xl text-left flex justify-between items-center hover:border-blue-400 transition-colors"
            >
              <div className="flex items-center">
                <FiShoppingCart className="mr-3 text-gray-400" />
                <span className="text-gray-500">Cliquez pour sélectionner un achat...</span>
              </div>
              <FiChevronDown className={`transition-transform ${showAchatDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showAchatDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-96 overflow-y-auto">
                <div className="p-3 border-b sticky top-0 bg-white">
                  <div className="relative">
                    <input
                      type="text"
                      value={achatSearchTerm}
                      onChange={(e) => setAchatSearchTerm(e.target.value)}
                      placeholder="Rechercher par référence ou fournisseur..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div className="py-2">
                  {loadingAchats ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : filteredAchats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Aucun achat trouvé
                    </div>
                  ) : (
                    filteredAchats.map(achat => (
                      <div
                        key={achat.id}
                        onClick={() => handleAchatSelect(achat)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">{achat.reference}</div>
                            <div className="text-sm text-gray-600 mt-1 flex items-center">
                              <FiTruck className="mr-1" size={12} />
                              {achat.fournisseur?.nom || 'Fournisseur inconnu'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-700 flex items-center">
                              <FiCalendar className="mr-1" size={12} />
                              {formatDate(achat.date)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <FiShoppingCart className="text-blue-600 mr-2" />
                  <span className="font-medium text-gray-800">{selectedAchat.reference}</span>
                  <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded-full">
                    {prixList.length} prix
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <FiTruck className="inline mr-1" size={12} />
                  Fournisseur: {selectedAchat.fournisseur?.nom}
                </div>
              </div>
              <button
                onClick={resetSelection}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Changer d'achat"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Étape 2 : Préparation des matériels */}
      {selectedAchat && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="bg-green-100 text-green-800 w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
            Préparer les matériels
          </h3>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : prixList.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiPackage className="mx-auto text-4xl text-gray-400 mb-3" />
              <p className="text-gray-600">Aucun prix trouvé pour cet achat</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prixList.map((prix) => {
                const progress = getProgress(prix.id, prix.quantite);
                const isExpanded = expandedPrix === prix.id;
                const currentImportData = importData[prix.id] || [];
                const currentErrors = importErrors[prix.id] || [];
                const showPreview = showImportPreview[prix.id];

                return (
                  <div key={prix.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* En-tête du prix */}
                    <div
                      onClick={() => handleExpandPrix(prix.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-800">{prix.numeroPrix}</span>
                            <span className="text-sm text-gray-600">-</span>
                            <span className="text-sm text-gray-700">{prix.designation}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              Qté: {prix.quantite}
                            </span>
                            
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 transition-all"
                                  style={{ width: `${(progress.prepared / progress.total) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">
                                {progress.prepared}/{progress.total} préparés
                              </span>
                            </div>

                            {progress.prepared === progress.total && progress.total > 0 && (
                              <span className="text-green-600 flex items-center text-sm">
                                <FiCheck className="mr-1" size={16} />
                                Complet
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          {isExpanded ? (
                            <FiChevronUp className="text-gray-400" size={20} />
                          ) : (
                            <FiChevronDown className="text-gray-400" size={20} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contenu détaillé */}
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        {/* Actions */}
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={() => downloadTemplate(prix)}
                            className="px-3 py-2 text-sm border border-gray-300 bg-white rounded-lg hover:bg-gray-50 flex items-center"
                          >
                            <FiDownload className="mr-1" size={16} />
                            Modèle Excel
                          </button>
                          
                          <label className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center cursor-pointer">
                            <FiUpload className="mr-1" size={16} />
                            Importer Excel
                            <input
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={(e) => handleFileImport(e, prix)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Aperçu de l'import */}
                        {showPreview && currentImportData.length > 0 && (
                          <div className="mb-4 border rounded-lg overflow-hidden bg-white">
                            <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
                              <span className="font-medium text-gray-700">Aperçu des données importées</span>
                              {currentErrors.length > 0 && (
                                <span className="text-sm text-red-600 flex items-center">
                                  <FiAlertCircle className="mr-1" size={14} />
                                  {currentErrors.length} erreur(s)
                                </span>
                              )}
                            </div>
                            
                            <div className="p-4 max-h-64 overflow-y-auto">
                              {currentErrors.length > 0 && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-sm font-medium text-red-800 mb-2">Erreurs détectées :</p>
                                  <ul className="text-sm text-red-700 list-disc list-inside">
                                    {currentErrors.map((err, idx) => (
                                      <li key={idx}>
                                        {err.ligne > 0 ? `Ligne ${err.ligne} : ` : ''}
                                        {err.erreurs.join(', ')}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2">N° Série</th>
                                    <th className="text-left py-2">N° Inventaire</th>
                                    <th className="text-left py-2">Observations</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {currentImportData.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                      <td className="py-2 font-mono text-xs">
                                        {item.numeroSerie || <span className="text-gray-400">-</span>}
                                      </td>
                                      <td className="py-2 font-mono text-xs">
                                        {item.numeroInventaire || <span className="text-gray-400">-</span>}
                                      </td>
                                      <td className="py-2 text-xs text-gray-600">
                                        {item.observations || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            
                            <div className="bg-gray-100 p-3 border-t flex justify-end gap-2">
                              <button
                                onClick={() => cancelImport(prix.id)}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-200"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={() => savePreparedMaterials(prix)}
                                disabled={currentErrors.length > 0 || processing}
                                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                              >
                                {processing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                    Enregistrement...
                                  </>
                                ) : (
                                  <>
                                    <FiSave className="mr-1" size={14} />
                                    Enregistrer
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Liste des matériels existants */}
                        {materielsData[prix.id]?.length > 0 && (
                          <div className="border rounded-lg overflow-hidden bg-white">
                            <div className="bg-gray-100 p-3 border-b">
                              <span className="font-medium text-gray-700">
                                Matériels existants ({materielsData[prix.id].length})
                              </span>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">N° Série</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">N° Inventaire</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">État</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {materielsData[prix.id].map((materiel) => (
                                    <tr key={materiel.id}>
                                      <td className="px-4 py-2 text-sm font-mono">
                                        {materiel.numeroSerie || '-'}
                                      </td>
                                      <td className="px-4 py-2 text-sm font-mono">
                                        {materiel.numeroInventaire || '-'}
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                          materiel.numeroSerie || materiel.numeroInventaire
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {materiel.numeroSerie || materiel.numeroInventaire ? 'Préparé' : 'En attente'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PreparationMateriels;