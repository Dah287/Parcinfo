import React, { useState, useEffect } from 'react';
import {
  FiUpload, FiDownload, FiCheck, FiX, FiAlertCircle,
  FiPackage, FiShoppingCart, FiSave, FiChevronDown, FiChevronUp,
  FiSearch, FiTruck, FiCalendar, FiMonitor, FiEdit2
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { getAllAchats, getPrixByAchat } from '../../services/achatService';
import { 
  getMaterielsByPrix,
  preparerMateriels 
} from '../../services/materialService';
import { toast } from 'react-toastify';

const PreparationMateriels = ({ onComplete }) => {
  // === ÉTATS ===
  const [achats, setAchats] = useState([]);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [achatSearchTerm, setAchatSearchTerm] = useState('');
  const [loadingAchats, setLoadingAchats] = useState(true);

  const [prixList, setPrixList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [expandedPrix, setExpandedPrix] = useState(null);
  
  
  // Matériels par prix : { [prixId]: Material[] }
  const [materielsData, setMaterielsData] = useState({});
  
  // Édition inline : { [`${prixId}_${materielId}`]: { numeroSerie, numeroSerieEcran } }
  const [editingSerials, setEditingSerials] = useState({});
  
  // Import Excel
  const [importData, setImportData] = useState({});
  const [importErrors, setImportErrors] = useState({});
  const [showImportPreview, setShowImportPreview] = useState({});


  const [loadingMateriels, setLoadingMateriels] = useState(false);
  // === CHARGEMENT INITIAL ===
  useEffect(() => { loadAchats(); }, []);

  const loadAchats = async () => {
    try {
      setLoadingAchats(true);
      const response = await getAllAchats();
      setAchats(response.data?.filter(a => a.statut !== 'ANNULE') || []);
    } catch (error) {
      toast.error('Erreur chargement des achats');
    } finally {
      setLoadingAchats(false);
    }
  };

  // === SÉLECTION ACHAT ===
// Ajouter un nouvel état pour le chargement global des matériels

// Dans handleAchatSelect, après avoir récupéré les prix :
const handleAchatSelect = async (achat) => {
  setSelectedAchat(achat);
  setShowAchatDropdown(false);
  setAchatSearchTerm('');

  try {
    setLoading(true);
    const response = await getPrixByAchat(achat.id);
    const prix = response.data || [];
    setPrixList(prix);
    
    // Initialiser les états
    const init = {};
    prix.forEach(p => { init[p.id] = []; });
    setMaterielsData(init);
    setImportData(init);
    setImportErrors(init);
    setShowImportPreview(init);
    setEditingSerials({});
    
    toast.success(`${prix.length} prix chargés`);

    // Charger les matériels pour tous les prix (si prix non vide)
    if (prix.length > 0) {
      setLoadingMateriels(true);
      try {
        const promises = prix.map(p => getMaterielsByPrix(p.id));
        const results = await Promise.all(promises);
        const newMaterielsData = {};
        prix.forEach((p, index) => {
          newMaterielsData[p.id] = results[index].data || [];
        });
        setMaterielsData(newMaterielsData);
      } catch (error) {
        toast.error('Erreur lors du chargement des matériels');
      } finally {
        setLoadingMateriels(false);
      }
    }

  } catch (error) {
    toast.error('Erreur chargement des prix');
  } finally {
    setLoading(false);
  }
};

  // === FILTRES ===
  const filteredAchats = achats.filter(a => {
    const s = achatSearchTerm.toLowerCase();
    return a.reference?.toLowerCase().includes(s) || a.fournisseur?.nom?.toLowerCase().includes(s);
  });

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : '';

  // === CHARGEMENT MATÉRIELS POUR UN PRIX ===
  const loadMaterielsForPrix = async (prixId) => {
    try {
      const response = await getMaterielsByPrix(prixId);
      setMaterielsData(prev => ({ ...prev, [prixId]: response.data || [] }));
    } catch (error) {
      console.error('Erreur chargement matériels:', error);
      setMaterielsData(prev => ({ ...prev, [prixId]: [] }));
    }
  };

  const handleExpandPrix = (prixId) => {
    if (expandedPrix === prixId) {
      setExpandedPrix(null);
    } else {
      setExpandedPrix(prixId);
      if (!materielsData[prixId]?.length) {
        loadMaterielsForPrix(prixId);
      }
    }
  };

  // === GESTION ÉDITION INLINE ===
  const handleSerialChange = (prixId, materielId, field, value) => {
    const key = `${prixId}_${materielId}`;
    setEditingSerials(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value.trim().toUpperCase()
      }
    }));
  };

  const isModified = (prixId, materiel, field) => {
    const key = `${prixId}_${materiel.id}`;
    const edited = editingSerials[key]?.[field];
    const original = materiel[field];
    return edited !== undefined && edited !== original;
  };

  const getDisplayValue = (prixId, materiel, field) => {
    const key = `${prixId}_${materiel.id}`;
    return editingSerials[key]?.[field] ?? materiel[field] ?? '';
  };

  // === TEMPLATE EXCEL (sans N° Inventaire) ===
  const downloadTemplate = (prix) => {
    const hasEcran = prix.nature?.toLowerCase().includes('ordinateur') || prix.ecran;
    const template = [];
    
    for (let i = 0; i < prix.quantite; i++) {
      const row = {
        'N° Prix': prix.numeroPrix,
        'Désignation': prix.designation,
        'Nature': prix.nature || '',
        'N° Série Matériel': '',  // À remplir
        'Marque': prix.marque || '',
        'Modèle': prix.designation || '',
        'Caractéristiques': `${prix.processeur || ''} ${prix.ram || ''} ${prix.disque || ''}`.trim(),
      };
      if (hasEcran) {
        row['N° Série Écran'] = '';  // À remplir si écran
      }
      row['Observations'] = '';
      template.push(row);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = [
      { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 40 },
      ...(hasEcran ? [{ wch: 20 }] : []),
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Matériels');
    XLSX.writeFile(wb, `preparation_${prix.numeroPrix}.xlsx`);
    toast.success('Template téléchargé');
  };

  // === IMPORT EXCEL ===
const handleFileImport = (event, prix) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {  // 🔥 async pour pouvoir charger les matériels
    try {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

      // 🔥 Étape 1 : Charger les matériels existants pour ce prix (si pas déjà chargés)
      let materielsExistants = materielsData[prix.id] || [];
      if (materielsExistants.length === 0) {
        const response = await getMaterielsByPrix(prix.id);
        materielsExistants = response.data || [];
        setMaterielsData(prev => ({ ...prev, [prix.id]: materielsExistants }));
      }

      const errors = [], validData = [];
      const serieMap = new Map(), ecranMap = new Map();
      const hasEcran = prix.nature?.toLowerCase().includes('ordinateur') || prix.ecran;

      // 🔥 Étape 2 : Parser et valider chaque ligne Excel
      json.forEach((row, idx) => {
        const ligne = idx + 2;
        const numeroSerie = row['N° Série Matériel']?.toString()?.trim()?.toUpperCase() || '';
        const numeroSerieEcran = hasEcran 
          ? (row['N° Série Écran']?.toString()?.trim()?.toUpperCase() || '') 
          : null;
        
        const lineErrors = [];
        
        if (!numeroSerie) {
          lineErrors.push('N° Série Matériel requis');
        }
        if (numeroSerie && serieMap.has(numeroSerie)) {
          lineErrors.push(`Série matériel "${numeroSerie}" en double (ligne ${serieMap.get(numeroSerie)})`);
        } else if (numeroSerie) {
          serieMap.set(numeroSerie, ligne);
        }
        if (hasEcran && numeroSerieEcran && ecranMap.has(numeroSerieEcran)) {
          lineErrors.push(`Série écran "${numeroSerieEcran}" en double (ligne ${ecranMap.get(numeroSerieEcran)})`);
        } else if (hasEcran && numeroSerieEcran) {
          ecranMap.set(numeroSerieEcran, ligne);
        }

        if (lineErrors.length > 0) {
          errors.push({ ligne, erreurs: lineErrors, data: row });
        } else {
          // 🔥 Étape 3 : TROUVER LE MATÉRIEL CORRESPONDANT
          // Priorité 1 : Par index (même position dans le fichier Excel et en base)
          // Priorité 2 : Par série déjà existante (mise à jour)
          // Priorité 3 : Premier matériel sans série (affectation nouvelle)
          
          let materielCorrespondant = null;
          
          // 1. Par index
          if (idx < materielsExistants.length) {
            materielCorrespondant = materielsExistants[idx];
          }
          
          // 2. Par série existante (si l'utilisateur met à jour une série déjà enregistrée)
          if (!materielCorrespondant && numeroSerie) {
            materielCorrespondant = materielsExistants.find(m => 
              m.numeroSerie?.toUpperCase() === numeroSerie
            );
          }
          
          // 3. Premier matériel sans série (pour nouvelle affectation)
          if (!materielCorrespondant) {
            materielCorrespondant = materielsExistants.find(m => !m.numeroSerie);
          }
          
          if (!materielCorrespondant) {
            lineErrors.push('Aucun matériel disponible pour cette ligne');
            errors.push({ ligne, erreurs: lineErrors, data: row });
            return;
          }
          
          // 🔥 Étape 4 : Construire l'objet avec materialId
          validData.push({
            materialId: materielCorrespondant.id,  // 🔥 OBLIGATOIRE
            numeroSerie: numeroSerie || null,
            numeroSerieEcran: hasEcran ? (numeroSerieEcran || null) : null,
            observations: row['Observations']?.toString().trim() || null,
            prixId: prix.id
          });
        }
      });

      // Validation quantité
      if (validData.length + errors.length !== prix.quantite) {
        errors.push({ 
          ligne: 0, 
          erreurs: [`Quantité attendue: ${prix.quantite}, lignes valides: ${json.length}`] 
        });
      }

      // Mise à jour des états
      setImportData(prev => ({ ...prev, [prix.id]: validData }));
      setImportErrors(prev => ({ ...prev, [prix.id]: errors }));
      setShowImportPreview(prev => ({ ...prev, [prix.id]: true }));

      // Feedback utilisateur
      if (errors.length === 0 && validData.length === prix.quantite) {
        toast.success(`${validData.length} matériels validés ✅`);
      } else if (errors.length > 0) {
        toast.warning(`${errors.length} erreur(s) à corriger ⚠️`);
      }

    } catch (err) {
      console.error('Erreur parsing Excel:', err);
      toast.error('Erreur lecture fichier: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
  event.target.value = null;
};
  // === ENREGISTREMENT (manuel ou import) ===
// === ENREGISTREMENT (manuel ou import) - VERSION CORRIGÉE ===
const savePreparedMaterials = async (prix, mode = 'manual') => {
  const materiels = materielsData[prix.id] || [];
  let updates = [];

  if (mode === 'import') {
    // Mode import : utiliser les données validées du fichier Excel
    updates = importData[prix.id] || [];
  } else {
    // 🔧 MODE MANUEL CORRIGÉ : Envoyer TOUS les matériels avec leurs séries actuelles
    updates = materiels.map(m => {
      const key = `${prix.id}_${m.id}`;
      const edits = editingSerials[key] || {};
      
      return {
        // Priorité : valeur éditée > valeur existante > null
        numeroSerie: edits.numeroSerie !== undefined 
          ? edits.numeroSerie 
          : (m.numeroSerie || null),
        numeroSerieEcran: edits.numeroSerieEcran !== undefined 
          ? edits.numeroSerieEcran 
          : (m.numeroSerieEcran || null),
        observations: m.observations || null,
        prixId: prix.id,
        materialId: m.id // 🔥 Important : identifier le matériel à mettre à jour
      };
    }).filter(item => item.numeroSerie); // 🔥 Filtrer uniquement ceux avec série
    
    // 🔥 Validation frontend avant envoi
    const missing = updates.filter(u => !u.numeroSerie);
    if (missing.length > 0) {
      toast.error(`${missing.length} numéro(s) de série manquant(s)`);
      return;
    }
  }

  if (updates.length === 0) {
    toast.info('Aucune modification à enregistrer');
    return;
  }

  try {
    setProcessing(true);
    const response = await preparerMateriels(prix.id, updates);
    
    toast.success(`${response.data?.length || updates.length} matériel(s) mis à jour`);
    
    // Recharger les matériels + nettoyer l'état d'édition
    await loadMaterielsForPrix(prix.id);
    
    // Nettoyer uniquement les éditions de ce prix
    setEditingSerials(prev => {
      const cleaned = { ...prev };
      Object.keys(cleaned).forEach(k => { 
        if (k.startsWith(`${prix.id}_`)) delete cleaned[k]; 
      });
      return cleaned;
    });
    
    if (mode === 'import') {
      setImportData(prev => ({ ...prev, [prix.id]: [] }));
      setImportErrors(prev => ({ ...prev, [prix.id]: [] }));
      setShowImportPreview(prev => ({ ...prev, [prix.id]: false }));
    }
    
    onComplete?.();
    
  } catch (error) {
    // 🔥 Afficher les erreurs détaillées du backend
    const errorMsg = error.response?.data?.message || error.message || 'Erreur enregistrement';
    toast.error(errorMsg);
    
    // 🔥 Afficher les erreurs dans la console pour débogage
    console.error('Erreur détaillée:', error.response?.data);
  } finally {
    setProcessing(false);
  }
};

  // === STATS & UTILS ===
  const getProgress = (prixId, quantite) => {
    const materiels = materielsData[prixId] || [];
    const prepared = materiels.filter(m => m.numeroSerie).length;
    return { prepared, total: quantite };
  };

  const hasEcran = (prix) => {
    return prix.nature?.toLowerCase().includes('ordinateur') || prix.ecran || prix.ecranInventorie;
  };

  const cancelImport = (prixId) => {
    setShowImportPreview(prev => ({ ...prev, [prixId]: false }));
    setImportData(prev => ({ ...prev, [prixId]: [] }));
    setImportErrors(prev => ({ ...prev, [prixId]: [] }));
  };

  const resetSelection = () => {
    setSelectedAchat(null);
    setPrixList([]);
    setExpandedPrix(null);
    setMaterielsData({});
    setEditingSerials({});
    setImportData({});
    setImportErrors({});
    setShowImportPreview({});
  };

  // === RENDER ===
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-[98vw] mx-auto">
      
      {/* En-tête */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiPackage className="mr-2 text-blue-600" />
          Préparation des Numéros de Série
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Saisissez ou modifiez les numéros de série des matériels et écrans
        </p>
      </div>

      {/* Étape 1 : Achat */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="bg-blue-100 text-blue-800 w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
          Sélectionner un achat
        </label>
        
        {!selectedAchat ? (
          <div className="relative">
            <button onClick={() => setShowAchatDropdown(!showAchatDropdown)}
              className="w-full p-4 border rounded-xl text-left flex justify-between hover:border-blue-400 bg-white">
              <div className="flex items-center">
                <FiShoppingCart className="mr-3 text-gray-400" />
                <span className="text-gray-500">Rechercher un achat...</span>
              </div>
              <FiChevronDown className={`transition-transform ${showAchatDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showAchatDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-80 overflow-y-auto">
                <div className="p-3 border-b sticky top-0 bg-white">
                  <input type="text" value={achatSearchTerm} onChange={(e) => setAchatSearchTerm(e.target.value)}
                    placeholder="Référence ou fournisseur..." className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                </div>
                <div className="py-2">
                  {loadingAchats ? (
                    <div className="p-4 text-center"><div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 mx-auto"/></div>
                  ) : filteredAchats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Aucun achat trouvé</div>
                  ) : filteredAchats.map(achat => (
                    <button key={achat.id} onClick={() => handleAchatSelect(achat)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0">
                      <div className="flex justify-between">
                        <span className="font-medium">{achat.reference}</span>
                        <span className="text-xs text-gray-500">{formatDate(achat.date)}</span>
                      </div>
                      <span className="text-xs text-gray-500">{achat.fournisseur?.nom}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex justify-between">
            <div>
              <span className="font-medium">{selectedAchat.reference}</span>
              <span className="ml-2 text-sm text-gray-600">{selectedAchat.fournisseur?.nom}</span>
            </div>
            <button onClick={resetSelection} className="text-gray-400 hover:text-gray-600"><FiX size={18}/></button>
          </div>
        )}
      </div>

      {/* Étape 2 : Prix et Matériels */}
      {selectedAchat && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <span className="bg-green-100 text-green-800 w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
            Préparer les matériels ({prixList.length} prix)
          </label>

          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500"/></div>
          ) : prixList.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-600">
              <FiAlertCircle className="mx-auto text-3xl mb-2"/> Aucun prix trouvé
            </div>
          ) : (
            <div className="space-y-4">
              {prixList.map(prix => {
                const materiels = materielsData[prix.id] || [];
                const progress = getProgress(prix.id, prix.quantite);
                const isExpanded = expandedPrix === prix.id;
                const hasEcranField = hasEcran(prix);
                const importPreview = showImportPreview[prix.id];
                const importDataPrix = importData[prix.id] || [];
                const importErrorsPrix = importErrors[prix.id] || [];

                return (
                  <div key={prix.id} className="border rounded-xl overflow-hidden">
                    
                    {/* Header Prix */}
                    <button onClick={() => handleExpandPrix(prix.id)}
                      className={`w-full p-4 text-left flex justify-between transition-colors ${isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{prix.numeroPrix}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-700">{prix.designation}</span>
                          {hasEcranField && (
                            <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full flex items-center">
                              <FiMonitor className="mr-1" size={10}/> Avec écran
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Qté: {prix.quantite}</span>
                          <div className="flex items-center gap-2 flex-1 max-w-xs">
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 transition-all" style={{width: `${(progress.prepared/progress.total)*100}%`}}/>
                            </div>
                            <span className="text-xs text-gray-600">{progress.prepared}/{progress.total}</span>
                          </div>
                          {progress.prepared === progress.total && progress.total > 0 && (
                            <span className="text-green-600 text-xs flex items-center"><FiCheck className="mr-1" size={12}/> OK</span>
                          )}
                        </div>
                      </div>
                      {isExpanded ? <FiChevronUp/> : <FiChevronDown/>}
                    </button>

                    {/* Contenu */}
                    {isExpanded && (
                      <div className="p-4 border-t bg-gray-50">
                        
                        {/* Actions */}
                        <div className="flex gap-2 mb-4">
                          <button onClick={() => downloadTemplate(prix)}
                            className="px-3 py-1.5 text-sm border bg-white rounded-lg hover:bg-gray-50 flex items-center">
                            <FiDownload className="mr-1" size={14}/> Template Excel
                          </button>
                          <label className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center cursor-pointer">
                            <FiUpload className="mr-1" size={14}/> Importer Excel
                            <input type="file" accept=".xlsx,.xls" onChange={(e) => handleFileImport(e, prix)} className="hidden"/>
                          </label>
                        </div>

                        {/* Aperçu Import */}
{/* Dans le rendu - Aperçu Import - VERSION CORRIGÉE */}
{importPreview && (
  <div className="mb-4 p-4 bg-white border border-blue-200 rounded-lg">
    <div className="flex justify-between items-center mb-3">
      <div>
        <span className="font-medium">
          {importDataPrix.length > 0 
            ? `${importDataPrix.length} affectation(s)` 
            : 'Aucune donnée valide'}
        </span>
        {importErrorsPrix.length > 0 && (
          <span className="ml-2 text-sm text-red-600">
            ({importErrorsPrix.length} erreur{importErrorsPrix.length > 1 ? 's' : ''})
          </span>
        )}
      </div>
      <button onClick={() => cancelImport(prix.id)} className="text-gray-400 hover:text-gray-600">
        <FiX size={16}/>
      </button>
    </div>
    
    {/* 🔥 Afficher les erreurs de façon visible */}
    {importErrorsPrix.length > 0 && (
      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 max-h-40 overflow-y-auto">
        <p className="font-medium mb-2 flex items-center">
          <FiAlertCircle className="mr-1"/> Erreurs à corriger :
        </p>
        <ul className="list-disc list-inside space-y-1">
          {importErrorsPrix.map((err, i) => (
            <li key={i}>
              {err.ligne > 0 ? `Ligne ${err.ligne}: ` : ''}
              {err.erreurs.join('; ')}
            </li>
          ))}
        </ul>
      </div>
    )}
    
    {/* 🔥 Aperçu des données valides (même si erreurs) */}
    {importDataPrix.length > 0 && (
      <div className="mb-3">
        <p className="text-xs text-gray-600 mb-1">Données valides :</p>
        <div className="max-h-32 overflow-y-auto text-xs bg-gray-50 p-2 rounded border">
          {importDataPrix.slice(0, 5).map((d, i) => (
            <div key={i} className="py-1 border-b last:border-0 font-mono">
              {d.numeroSerie} {d.numeroSerieEcran ? `| Écran: ${d.numeroSerieEcran}` : ''}
            </div>
          ))}
          {importDataPrix.length > 5 && (
            <div className="text-center text-gray-500 py-1">
              ... et {importDataPrix.length - 5} autre(s)
            </div>
          )}
        </div>
      </div>
    )}
    
    {/* Actions */}
    <div className="flex justify-end gap-2">
      <button 
        onClick={() => cancelImport(prix.id)} 
        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100"
      >
        Annuler
      </button>
      <button 
        onClick={() => savePreparedMaterials(prix, 'import')} 
        disabled={importErrorsPrix.length > 0 || processing || importDataPrix.length === 0}
        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
        title={importErrorsPrix.length > 0 ? 'Corrigez les erreurs avant d\'enregistrer' : ''}
      >
        <FiSave className="mr-1" size={14}/> Enregistrer
      </button>
    </div>
  </div>
)}

                        {/* Liste Matériels */}
                        {materiels.length === 0 ? (
                          <div className="text-center py-6 text-gray-500">
                            <FiAlertCircle className="mx-auto text-2xl mb-2"/>
                            Aucun matériel trouvé pour ce prix
                          </div>
                        ) : (
                          <>
                            <div className="overflow-x-auto bg-white rounded-lg border">
                              <table className="w-full text-sm min-w-[900px]">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="text-left py-2.5 px-3 font-medium text-gray-600 min-w-[180px]">N° Série Matériel *</th>
                                    {hasEcranField && (
                                      <th className="text-left py-2.5 px-3 font-medium text-gray-600 min-w-[180px]">N° Série Écran</th>
                                    )}
                                    <th className="text-left py-2.5 px-3 font-medium text-gray-600">Nature</th>
                                    <th className="text-left py-2.5 px-3 font-medium text-gray-600">État</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {materiels.map(materiel => {
                                    const key = `${prix.id}_${materiel.id}`;
                                    const serieVal = getDisplayValue(prix.id, materiel, 'numeroSerie');
                                    const ecranVal = getDisplayValue(prix.id, materiel, 'numeroSerieEcran');
                                    const serieModified = isModified(prix.id, materiel, 'numeroSerie');
                                    const ecranModified = isModified(prix.id, materiel, 'numeroSerieEcran');
                                    const isPrepared = serieVal || ecranVal;
                                    
                                    return (
                                      <tr key={materiel.id} className={`hover:bg-gray-50 ${serieModified || ecranModified ? 'bg-yellow-50' : ''}`}>
                                        {/* N° Série Matériel */}
                                        <td className="py-2.5 px-3">
                                          <input
                                            type="text"
                                            value={serieVal}
                                            onChange={(e) => handleSerialChange(prix.id, materiel.id, 'numeroSerie', e.target.value)}
                                            placeholder="Saisir N° Série"
                                            className={`w-full px-3 py-1.5 border rounded text-xs font-mono focus:outline-none focus:ring-2 ${
                                              serieModified ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-500' :
                                              serieVal ? 'border-green-300 bg-green-50 focus:ring-green-500' :
                                              'border-gray-300 focus:ring-blue-500'
                                            }`}
                                          />
                                          <div className="flex items-center gap-1 mt-1">
                                            {serieModified && <span className="text-xs text-yellow-700 flex items-center"><FiEdit2 className="mr-0.5" size={10}/> Modifié</span>}
                                            {!serieModified && serieVal && <span className="text-xs text-green-700 flex items-center"><FiCheck className="mr-0.5" size={10}/> Attribué</span>}
                                            {!serieVal && <span className="text-xs text-red-500">Requis</span>}
                                          </div>
                                        </td>
                                        
                                        {/* N° Série Écran (si applicable) */}
                                        {hasEcranField && (
                                          <td className="py-2.5 px-3">
                                            <input
                                              type="text"
                                              value={ecranVal}
                                              onChange={(e) => handleSerialChange(prix.id, materiel.id, 'numeroSerieEcran', e.target.value)}
                                              placeholder="Saisir N° Série Écran"
                                              className={`w-full px-3 py-1.5 border rounded text-xs font-mono focus:outline-none focus:ring-2 ${
                                                ecranModified ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-500' :
                                                ecranVal ? 'border-green-300 bg-green-50 focus:ring-green-500' :
                                                'border-gray-300 focus:ring-blue-500'
                                              }`}
                                            />
                                            {ecranModified && <span className="text-xs text-yellow-700 mt-1 block flex items-center"><FiEdit2 className="mr-0.5" size={10}/> Modifié</span>}
                                          </td>
                                        )}
                                        
                                        {/* Nature */}
                                        <td className="py-2.5 px-3 text-gray-700">{prix.nature || '-'}</td>
                                        
                                        {/* État */}
                                        <td className="py-2.5 px-3">
                                          <span className={`px-2 py-1 text-xs rounded-full ${
                                            isPrepared ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {isPrepared ? 'Préparé' : 'En attente'}
                                          </span>
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
                                onClick={() => savePreparedMaterials(prix, 'manual')}
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center">
                                {processing ? (
                                  <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"/> Enregistrement...</>
                                ) : (
                                  <><FiSave className="mr-2" size={16}/> Enregistrer les modifications</>
                                )}
                              </button>
                            </div>
                          </>
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