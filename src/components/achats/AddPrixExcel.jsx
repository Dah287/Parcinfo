import React, { useState, useEffect, useRef } from 'react';
import { 
  FiUpload, 
  FiFile, 
  FiX, 
  FiDownload,
  FiAlertCircle,
  FiCheck,
  FiInfo,
  FiShoppingCart,
  FiChevronDown,
  FiSearch,
  FiLayers,
  FiPrinter,
  FiCpu,
  FiHardDrive,
  FiMonitor,
  FiCheckCircle,
  FiServer,
  FiFileText,
  FiType,
  FiMousePointer,
  FiWifi,
  FiCamera,
  FiPhone
} from 'react-icons/fi';
import { 
  getAllAchats, 
  importerPrixExcel 
} from '../../services/achatService';
import * as XLSX from 'xlsx';

const AddPrixExcel = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [achats, setAchats] = useState([]);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [loadingAchats, setLoadingAchats] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Ref pour le conteneur principal
  const containerRef = useRef(null);

 // Liste complète des types de nature
  const natureOptions = [
    'Ordinateur',
    'Ordinateur portable',
    'Serveur',
    'Imprimante',
    'Scanner',
    'Photocopieur',
    'Onduleur',
    'Disque dur externe',
    'Disque SSD',
    'Clavier',
    'Souris',

    'Routeur',
    'Switch',

    'Camera IP',
    'Caméra de surveillance',

    'Microphone',
    'Webcam',

    'Autre'
  ];

  // Fonction pour faire défiler vers le haut
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Charger la liste des achats
  useEffect(() => {
    fetchAchats();
  }, []);

  // Effet pour défiler vers le haut quand successMessage change
  useEffect(() => {
    if (successMessage) {
      scrollToTop();
    }
  }, [successMessage]);

  // Fonction sécurisée pour fermer le modal
  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    } else {
      console.warn('onClose n\'est pas une fonction valide');
    }
  };

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

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setError('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setImportResult(null);
    setSuccessMessage(null);
    
    parseExcelFile(selectedFile);
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false
        });

        const parsedData = parseExcelData(jsonData);
        setPreviewData(parsedData);
        setPreviewMode(true);
        
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier Excel:', error);
        setError('Erreur lors de la lecture du fichier Excel. Vérifiez le format.');
        setPreviewData([]);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Erreur FileReader:', error);
      setError('Erreur lors de la lecture du fichier');
      setPreviewData([]);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const parseExcelData = (rows) => {
    if (!rows || rows.length < 2) {
      return [];
    }

    const dataRows = rows.slice(1);
    const parsedRows = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      if (row[0]?.toString().toUpperCase().includes('NOTE') || 
          row[1]?.toString().toUpperCase().includes('NOTE')) {
        continue;
      }

      const prix = {
        numeroPrix: row[0]?.toString().trim() || '',
        designation: row[1]?.toString().trim() || '',
        nature: row[2]?.toString().trim() || '',
        typeImprimante: row[3]?.toString().trim() || '',
        marque: row[4]?.toString().trim() || '',
        inventorie: parseBoolean(row[5]),
        parc: parseBoolean(row[6]),
        formatPapier: row[7]?.toString().trim() || '',
        puissanceOnduleur: row[8]?.toString().trim() || '',
        processeur: row[9]?.toString().trim() || '',
        disque: row[10]?.toString().trim() || '',
        vitesse: row[11]?.toString().trim() || '',
        ram: row[12]?.toString().trim() || '',
        ecran: row[13]?.toString().trim() || '',
        ecranInventorie: parseBoolean(row[14]),
        systemeExploitation: row[15]?.toString().trim() || '',
        unite: row[16]?.toString().trim() || 'U',
        quantite: parseFloat(row[17]) || 0,
        prixUnitaireHT: parseFloat(row[18]) || 0
      };

      if (prix.numeroPrix || prix.designation || prix.quantite > 0 || prix.prixUnitaireHT > 0) {
        parsedRows.push(prix);
      }

      if (parsedRows.length >= 20) break;
    }

    return parsedRows;
  };

  const parseBoolean = (cell) => {
    if (!cell) return false;
    const value = cell.toString().trim().toLowerCase();
    return value === 'oui' || value === 'true' || value === '1' || value === 'yes';
  };

  const handleImport = async () => {
    if (!selectedAchat) {
      setError('Veuillez sélectionner un achat');
      return;
    }

    if (!file) {
      setError('Veuillez sélectionner un fichier Excel');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setSuccessMessage(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await importerPrixExcel(selectedAchat.id, formData);
      const result = response.data;

      setImportResult(result);

      if (result.succes) {
        const message = `✅ Importation réussie !\n` +
          `📊 ${result.lignesImportees} nouveau(x) prix importé(s)\n` +
          `🔄 ${result.lignesMiseAJour} prix mis à jour\n` +
          `📦 Total: ${result.lignesImportees + result.lignesMiseAJour} prix traités`;
        
        setSuccessMessage(message);
        
        // Notification visuelle
        alert(message);

        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(result.lignesImportees, result.lignesMiseAJour, selectedAchat.id);
        }

        // Fermer le modal après 2 secondes si tout est OK
        setTimeout(() => {
          if (result.lignesEnErreur === 0) {
            handleClose();
          }
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || 'Une erreur est survenue lors de l\'importation';
      setError(errorMsg);
      alert(`❌ Erreur: ${errorMsg}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Créer une feuille avec les données d'exemple
    const templateData = [
      [
        'Numéro Prix', 'Désignation', 'Nature', 'Type Imprimante', 'Marque',
        'Inventorié', 'Parc', 'Format Papier', 'Puissance Onduleur', 'Processeur',
        'Disque', 'Vitesse', 'RAM', 'Ecran', 'Ecran Inventorié',
        'Système Exploitation', 'Unité', 'Quantité', 'Prix HT (DH)'
      ],
      [
        'P001', 'Ordinateur portable Dell', 'Ordinateur portable', '', 'Dell',
        'Oui', 'Oui', '', '', 'Intel Core i7',
        '512GB SSD', '3.4 GHz', '16GB', '15.6"', 'Non',
        'Windows 11', 'U', '5', '1200.00'
      ],
      [
        'P002', 'Imprimante Laser HP', 'Imprimante', 'Laser', 'HP',
        'Oui', 'Oui', 'A4', '', '',
        '', '20 ppm', '', '', '',
        '', 'U', '3', '350.00'
      ],
      [
        'P003', 'Onduleur APC', 'Onduleur', '', 'APC',
        'Oui', 'Oui', '', '1000VA', '',
        '', '', '', '', '',
        '', 'U', '2', '250.00'
      ]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Ajouter une validation de données pour la colonne Nature (colonne C)
    // Créer une liste de validation pour la colonne Nature (index 2 = colonne C)
    const natureValidation = {
      type: 'list',
      allowBlank: true,
      formula1: `"${natureOptions.join(',')}"`
    };

    // Appliquer la validation à toutes les cellules de la colonne Nature (sauf l'en-tête)
    if (!ws['!dataValidation']) {
      ws['!dataValidation'] = [];
    }

    // Appliquer la validation pour les lignes 2 à 1000 de la colonne C (index 2)
    for (let row = 2; row <= 1000; row++) {
      const cellRef = `C${row}`;
      ws['!dataValidation'].push({
        ...natureValidation,
        sqref: cellRef
      });
    }

    // Ajuster la largeur des colonnes
    ws['!cols'] = [
      { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 15 }
    ];

    // Ajouter une feuille d'instructions avec la liste des natures
    const instructionsData = [
      ['INSTRUCTIONS POUR L\'IMPORTATION DES PRIX'],
      [''],
      ['1. Colonnes obligatoires :'],
      ['   - Numéro Prix (doit être unique)'],
      ['   - Désignation'],
      ['   - Quantité (nombre)'],
      ['   - Prix HT (nombre)'],
      [''],
      ['2. Colonne Nature :'],
      ['   Utilisez la liste déroulante pour sélectionner une valeur parmi :'],
      ...natureOptions.map(nature => [`   - ${nature}`]),
      [''],
      ['3. Colonnes Oui/Non :'],
      ['   - Inventorié'],
      ['   - Parc'],
      ['   - Ecran Inventorié'],
      ['   Valeurs acceptées : Oui, Non, True, False, 1, 0'],
      [''],
      ['4. Exemple de données :'],
      ['   Voir la feuille "Modèle Prix" pour un exemple complet']
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Modèle Prix');
    
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    const fileName = selectedAchat 
      ? `modele_prix_${selectedAchat.reference.replace(/[^a-z0-9]/gi, '_')}.xlsx`
      : 'modele_importation_prix_complet.xlsx';

    XLSX.writeFile(wb, fileName);
  };

  const calculateTotalPreview = () => {
    return previewData.reduce((total, prix) => {
      return total + (prix.quantite * prix.prixUnitaireHT);
    }, 0).toFixed(2);
  };

  const getIconForNature = (nature) => {
    if (!nature) return <FiLayers className="text-gray-500" />;

    const natureLower = nature.toLowerCase();

    if (natureLower.includes('imprimante'))
      return <FiPrinter className="text-purple-500" />;

    if (natureLower.includes('ordinateur') || natureLower.includes('pc') || natureLower.includes('laptop'))
      return <FiCpu className="text-blue-500" />;

    if (natureLower.includes('serveur'))
      return <FiServer className="text-red-500" />;

    if (natureLower.includes('scanner'))
      return <FiFileText className="text-orange-500" />;

    if (natureLower.includes('disque') || natureLower.includes('ssd') || natureLower.includes('hdd'))
      return <FiHardDrive className="text-green-500" />;

    if (natureLower.includes('ecran') || natureLower.includes('moniteur'))
      return <FiMonitor className="text-indigo-500" />;

    if (natureLower.includes('clavier'))
      return <FiType className="text-yellow-600" />;

    if (natureLower.includes('souris'))
      return <FiMousePointer className="text-pink-500" />;

    if (natureLower.includes('routeur') || natureLower.includes('switch') || natureLower.includes('modem'))
      return <FiWifi className="text-cyan-500" />;

    if (natureLower.includes('camera') || natureLower.includes('caméra'))
      return <FiCamera className="text-teal-500" />;

    if (natureLower.includes('telephone') || natureLower.includes('téléphone'))
      return <FiPhone className="text-emerald-500" />;

    return <FiLayers className="text-gray-500" />;
  };

  return (
    <div ref={containerRef} className="bg-white rounded-lg shadow-xl p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Importation Excel des prix</h2>
          <p className="text-gray-600">Ajouter des prix avec toutes leurs caractéristiques techniques</p>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-800 rounded-lg flex items-start animate-pulse">
          <FiCheckCircle className="text-green-600 text-2xl mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Succès !</h3>
            <p className="whitespace-pre-line">{successMessage}</p>
            <p className="text-sm mt-2 text-green-600">
              La page va se fermer automatiquement...
            </p>
          </div>
        </div>
      )}

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
                      {selectedAchat.fournisseur?.nom} • {new Date(selectedAchat.date).toLocaleDateString('fr-FR')}
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
                  filteredAchats.map(achat => (
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
                      <div className="font-medium text-gray-800">{achat.reference}</div>
                      <div className="text-sm text-gray-600 flex justify-between mt-1">
                        <span>{achat.fournisseur?.nom}</span>
                        <span>{new Date(achat.date).toLocaleDateString('fr-FR')}</span>
                      </div>
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
              <div>
                <span className="font-medium text-green-800">Achat sélectionné:</span>
                <div className="text-sm text-green-700">
                  {selectedAchat.reference} • {selectedAchat.fournisseur?.nom}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Étape 2 : Sélection du fichier Excel */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
          Téléchargez votre fichier Excel
        </h3>
        
        <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-8 text-center">
          <FiUpload className="mx-auto text-blue-500 text-4xl mb-4" />
          
          <p className="text-lg font-medium text-gray-700 mb-2">
            {file ? file.name : 'Déposez votre fichier Excel ici'}
          </p>
          
          <p className="text-sm text-gray-500 mb-4">
            Format accepté: .xlsx, .xls
          </p>
          
          <div className="flex justify-center gap-3">
            <label className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors flex items-center">
              <FiUpload className="mr-2" />
              <span>Sélectionner un fichier</span>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={!selectedAchat}
              />
            </label>
            
            <button
              onClick={downloadTemplate}
              disabled={!selectedAchat}
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className="mr-2" />
              Télécharger modèle
            </button>
          </div>
        </div>

        {file && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <FiFile className="text-green-500 mr-2" />
              <div>
                <span className="font-medium">{file.name}</span>
                <p className="text-xs text-gray-500">
                  Taille: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              <FiX />
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <FiInfo className="mr-2" /> Format Excel requis (19 colonnes)
            </h3>
            <div className="text-sm text-yellow-700">
              <p className="mb-2">Le fichier doit contenir ces colonnes dans l'ordre :</p>
              <button
                onClick={() => setShowAllColumns(!showAllColumns)}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium mb-2"
              >
                {showAllColumns ? 'Masquer les détails' : 'Voir tous les champs'}
              </button>
            </div>
          </div>
        </div>

        {showAllColumns && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">1. N° Prix</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">2. Désignation</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">3. Nature</span> (liste déroulante dans le modèle)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">4. Type Imprimante</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">5. Marque</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">6. Inventorié</span> (Oui/Non)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">7. Parc</span> (Oui/Non)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">8. Format Papier</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">9. Puissance Onduleur</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">10. Processeur</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">11. Disque</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">12. Vitesse</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">13. RAM</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">14. Ecran</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">15. Ecran Inventorié</span> (Oui/Non)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">16. Système Exploitation</span> (texte)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">17. Unité</span> (U, LOT, etc.)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">18. Quantité</span> (nombre)
            </div>
            <div className="bg-white p-2 rounded border text-xs">
              <span className="font-bold">19. Prix HT</span> (nombre)
            </div>
          </div>
        )}

        {/* Liste des natures disponibles */}
        <div className="mt-4">
          <h4 className="font-medium text-yellow-800 mb-2">Types de nature disponibles :</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-white rounded border">
            {natureOptions.map((nature, index) => (
              <div key={index} className="text-xs text-gray-700 flex items-center">
                <FiCheck className="text-green-500 mr-1 flex-shrink-0" size={12} />
                {nature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton d'aperçu */}
      {file && previewData.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiAlertCircle className="mr-2" />
            {previewMode ? 'Masquer l\'aperçu' : 'Afficher l\'aperçu des données'}
          </button>

          {previewMode && (
            <div className="mt-3 bg-gray-50 p-4 rounded-lg overflow-x-auto">
              <h4 className="font-medium text-gray-700 mb-3">
                Aperçu des données ({previewData.length} lignes)
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1">N°</th>
                      <th className="px-2 py-1">Désignation</th>
                      <th className="px-2 py-1">Nature</th>
                      <th className="px-2 py-1">Marque</th>
                      <th className="px-2 py-1">Qté</th>
                      <th className="px-2 py-1">Prix HT</th>
                      <th className="px-2 py-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((prix, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-2 py-1">{prix.numeroPrix}</td>
                        <td className="px-2 py-1 max-w-xs truncate">{prix.designation}</td>
                        <td className="px-2 py-1">
                          <div className="flex items-center">
                            {getIconForNature(prix.nature)}
                            <span className="ml-1">{prix.nature || '-'}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1">{prix.marque || '-'}</td>
                        <td className="px-2 py-1">{prix.quantite}</td>
                        <td className="px-2 py-1">{prix.prixUnitaireHT.toFixed(2)}</td>
                        <td className="px-2 py-1 font-medium">
                          {(prix.quantite * prix.prixUnitaireHT).toFixed(2)} DH
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td colSpan="6" className="px-2 py-1 text-right font-medium">
                        Total général:
                      </td>
                      <td className="px-2 py-1 font-bold text-green-700">
                        {calculateTotalPreview()} DH
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Résultats de l'importation */}
      {importResult && (
        <div className={`mb-6 p-4 rounded-lg ${
          importResult.succes ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 flex items-center ${
            importResult.succes ? 'text-green-800' : 'text-red-800'
          }`}>
            {importResult.succes ? (
              <FiCheck className="mr-2" />
            ) : (
              <FiAlertCircle className="mr-2" />
            )}
            Résultat de l'importation
          </h3>
          
          <div className="text-sm space-y-1">
            <p>Lignes importées: <span className="font-medium">{importResult.lignesImportees}</span></p>
            <p>Lignes mises à jour: <span className="font-medium">{importResult.lignesMiseAJour}</span></p>
            <p>Lignes en erreur: <span className="font-medium">{importResult.lignesEnErreur}</span></p>
            
            {importResult.erreurs && importResult.erreurs.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Erreurs détectées:</p>
                <ul className="list-disc pl-5 text-red-700">
                  {importResult.erreurs.slice(0, 5).map((err, index) => (
                    <li key={index} className="text-xs">{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && !successMessage && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div>
          <p className="text-sm text-gray-600">
            {!selectedAchat ? (
              <span className="text-orange-600">Étape 1 : Sélectionnez un achat</span>
            ) : !file ? (
              <span className="text-orange-600">Étape 2 : Sélectionnez un fichier Excel</span>
            ) : (
              <span className="text-green-600">
                Prêt à importer {previewData.length} prix avec leurs caractéristiques
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={importing}
          >
            Annuler
          </button>
          
          <button
            onClick={handleImport}
            disabled={!selectedAchat || !file || importing || successMessage}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importation...
              </>
            ) : (
              <>
                <FiUpload className="mr-2" />
                Importer le fichier
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPrixExcel;