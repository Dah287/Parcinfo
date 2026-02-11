import React, { useState, useEffect } from 'react';
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
  FiSearch
} from 'react-icons/fi';

import { 
  getAllAchats, 
  searchAchats, 
  createAchat,
  updateAchat,
  deleteAchat,
  getPrixByAchat,
  getStats,
  importerPrixExcel
} from '../../services/achatService';


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

  // Charger la liste des achats
  useEffect(() => {
    fetchAchats();
  }, []);

const fetchAchats = async () => {
  try {
    setLoadingAchats(true);
    const response = await getAllAchats(); // Utilisation de la méthode existante
    setAchats(response.data); // Avec Axios, les données sont dans response.data
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

    // Vérifier le type de fichier
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setError('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setImportResult(null);
    
    // Simuler un aperçu (à remplacer par un vrai parsing Excel)
    simulatePreview(selectedFile);
  };

  const simulatePreview = (selectedFile) => {
    // Simulation d'aperçu - À remplacer par un vrai parsing Excel
    const simulatedData = [
      { numeroPrix: 'P001', designation: 'Ordinateur portable', unite: 'U', quantite: 5, prixUnitaireHT: 1200.00 },
      { numeroPrix: 'P002', designation: 'Souris sans fil', unite: 'U', quantite: 10, prixUnitaireHT: 25.50 },
      { numeroPrix: 'P003', designation: 'Clavier USB', unite: 'U', quantite: 8, prixUnitaireHT: 45.00 },
    ];
    setPreviewData(simulatedData);
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

    const formData = new FormData();
    formData.append('file', file);

    // Si vous utilisez Axios :
    const response = await importerPrixExcel(selectedAchat.id, formData);
    const result = response.data; // Les données sont ici

    setImportResult(result);

    if (result.succes && onSuccess) {
        onSuccess(result.lignesImportees, result.lignesMiseAJour, selectedAchat.id);
    }
} catch (err) {
    console.error(err);
    setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors de l\'importation');
} finally {
    setImporting(false);
}

  };

  const downloadTemplate = () => {
    // Créer un modèle Excel vide (simulation)
    const templateData = [
      ['Numéro Prix', 'Désignation', 'Unité', 'Quantité', 'Prix HT'],
      ['P001', 'Ex: Ordinateur portable', 'U', '5', '1200.00'],
      ['P002', 'Ex: Souris sans fil', 'U', '10', '25.50'],
      ['P003', 'Ex: Clavier USB', 'U', '8', '45.00'],
      ['', '', '', '', ''],
      ['NOTES:', '', '', '', ''],
      ['- Ne modifiez pas les noms de colonnes', '', '', '', ''],
      ['- Remplissez les données à partir de la ligne 2', '', '', '', ''],
      ['- Enregistrez le fichier en format .xlsx', '', '', '', '']
    ];

    let csvContent = "data:text/csv;charset=utf-8,";
    templateData.forEach(row => {
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `modele_prix_achat_${selectedAchat?.reference || 'template'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateTotalPreview = () => {
    return previewData.reduce((total, prix) => {
      return total + (prix.quantite * prix.prixUnitaireHT);
    }, 0).toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Importation Excel des prix</h2>
          <p className="text-gray-600">Ajouter des prix à un achat via fichier Excel</p>
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
                      <div className="text-xs text-gray-500 mt-1">
                        {achat.prixList?.length || 0} prix • {achat.type}
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
                  {selectedAchat.reference} • {selectedAchat.fournisseur?.nom} • 
                  Total: {(selectedAchat.prixList || []).reduce((sum, p) => sum + (p.quantite * p.prixUnitaireHT), 0).toFixed(2)} DH
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
        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
          <FiInfo className="mr-2" /> Format Excel requis
        </h3>
        <div className="text-sm text-yellow-700">
          <p className="mb-1">Le fichier doit contenir exactement 5 colonnes dans cet ordre :</p>
          <div className="grid grid-cols-5 gap-2 mt-2">
            <div className="bg-white p-2 rounded border text-center font-medium">Colonne A</div>
            <div className="bg-white p-2 rounded border text-center font-medium">Colonne B</div>
            <div className="bg-white p-2 rounded border text-center font-medium">Colonne C</div>
            <div className="bg-white p-2 rounded border text-center font-medium">Colonne D</div>
            <div className="bg-white p-2 rounded border text-center font-medium">Colonne E</div>
            <div className="text-center text-xs font-semibold">Numéro Prix</div>
            <div className="text-center text-xs font-semibold">Désignation</div>
            <div className="text-center text-xs font-semibold">Unité</div>
            <div className="text-center text-xs font-semibold">Quantité</div>
            <div className="text-center text-xs font-semibold">Prix HT (DH)</div>
          </div>
          <p className="mt-3">
            <strong>Important :</strong> La première ligne doit contenir les en-têtes.
          </p>
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
            <div className="mt-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">
                Aperçu des données ({previewData.length} lignes)
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">N° Prix</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Désignation</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Unité</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Quantité</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Prix HT</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((prix, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{prix.numeroPrix}</td>
                        <td className="px-3 py-2">{prix.designation}</td>
                        <td className="px-3 py-2">{prix.unite}</td>
                        <td className="px-3 py-2">{prix.quantite}</td>
                        <td className="px-3 py-2">{prix.prixUnitaireHT.toFixed(2)} DH</td>
                        <td className="px-3 py-2 font-medium">
                          {(prix.quantite * prix.prixUnitaireHT).toFixed(2)} DH
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td colSpan="5" className="px-3 py-2 text-right font-medium">
                        Total général:
                      </td>
                      <td className="px-3 py-2 font-bold text-green-700">
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
      {error && (
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
                Prêt à importer {previewData.length} prix
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={importing}
          >
            Annuler
          </button>
          
          <button
            onClick={handleImport}
            disabled={!selectedAchat || !file || importing}
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