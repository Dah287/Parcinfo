import React, { useState, useEffect } from 'react';
import { 
  FiSearch,
  FiRefreshCw,
  FiShoppingCart,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiPrinter,
  FiCpu,
  FiHardDrive,
  FiMonitor,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiChevronDown,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { getAllAchats, getPrixByAchat } from '../../services/achatService';
import * as XLSX from 'xlsx';

const ConsultationPrixAchat = () => {
  const [achats, setAchats] = useState([]);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [prixList, setPrixList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAchats, setLoadingAchats] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);

  // Charger la liste des achats au montage
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

  const handleAchatSelect = async (achat) => {
    setSelectedAchat(achat);
    setShowAchatDropdown(false);
    setSearchTerm('');

    try {
      setLoading(true);
      const response = await getPrixByAchat(achat.id);
      setPrixList(response.data || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des prix');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les achats pour la recherche
  const filteredAchats = achats.filter(achat => 
    achat.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achat.fournisseur?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formater les montants
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(montant) + ' DH';
  };

  // Calculer le total général
  const calculerTotalGeneral = () => {
    return prixList.reduce((total, prix) => {
      return total + (prix.quantite * prix.prixUnitaireHT);
    }, 0);
  };

  // Obtenir l'icône pour la nature
  const getNatureIcon = (nature) => {
    if (!nature) return '📦';
    const natureLower = nature.toLowerCase();
    if (natureLower.includes('ordinateur') || natureLower.includes('pc')) return '💻';
    if (natureLower.includes('imprimante')) return '🖨️';
    if (natureLower.includes('ecran') || natureLower.includes('moniteur')) return '🖥️';
    if (natureLower.includes('serveur')) return '🖧';
    if (natureLower.includes('reseau') || natureLower.includes('réseau')) return '🌐';
    return '📦';
  };

  // Exporter en Excel
  const exportToExcel = () => {
    const exportData = prixList.map(prix => ({
      'N° Prix': prix.numeroPrix,
      'Désignation': prix.designation,
      'Nature': prix.nature || '',
      'Type Imprimante': prix.typeImprimante || '',
      'Marque': prix.marque || '',
      'Inventorié': prix.inventorie ? 'Oui' : 'Non',
      'Dans le parc': prix.parc ? 'Oui' : 'Non',
      'Format Papier': prix.formatPapier || '',
      'Puissance Onduleur': prix.puissanceOnduleur || '',
      'Processeur': prix.processeur || '',
      'Disque': prix.disque || '',
      'Vitesse': prix.vitesse || '',
      'RAM': prix.ram || '',
      'Écran': prix.ecran || '',
      'Écran inventorié': prix.ecranInventorie ? 'Oui' : 'Non',
      'Système': prix.systemeExploitation || '',
      'Unité': prix.unite,
      'Quantité': prix.quantite,
      'Prix Unitaire HT': prix.prixUnitaireHT,
      'Total HT': prix.quantite * prix.prixUnitaireHT
    }));

    // Ajouter la ligne de total
    exportData.push({
      'N° Prix': 'TOTAL GÉNÉRAL',
      'Désignation': '',
      'Nature': '',
      'Type Imprimante': '',
      'Marque': '',
      'Inventorié': '',
      'Dans le parc': '',
      'Format Papier': '',
      'Puissance Onduleur': '',
      'Processeur': '',
      'Disque': '',
      'Vitesse': '',
      'RAM': '',
      'Écran': '',
      'Écran inventorié': '',
      'Système': '',
      'Unité': '',
      'Quantité': prixList.reduce((sum, p) => sum + p.quantite, 0),
      'Prix Unitaire HT': '',
      'Total HT': calculerTotalGeneral()
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    XLSX.utils.book_append_sheet(wb, ws, 'Prix');
    
    const fileName = selectedAchat 
      ? `prix_${selectedAchat.reference.replace(/[^a-z0-9]/gi, '_')}.xlsx`
      : 'liste_prix.xlsx';
    
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* En-tête */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiShoppingCart className="mr-3 text-blue-600" />
          Consultation des prix par achat
        </h2>
        <p className="text-gray-600 mt-1">
          Sélectionnez un achat pour voir la liste complète des prix
        </p>
      </div>

      {/* Sélecteur d'achat avec dropdown et recherche */}
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
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-96 overflow-y-auto">
              <div className="p-3 border-b sticky top-0 bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher une référence ou fournisseur..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={16} />
                    </button>
                  )}
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
                      onClick={() => handleAchatSelect(achat)}
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
                          <div className="text-sm text-gray-700">
                            {new Date(achat.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {achat.type}
                          </div>
                        </div>
                      </div>
                      {achat.prixList && achat.prixList.length > 0 && (
                        <div className="mt-2 text-xs text-green-600">
                          {achat.prixList.length} prix • Total: {formatMontant(achat.prixList.reduce((sum, p) => sum + (p.quantite * p.prixUnitaireHT), 0))}
                        </div>
                      )}
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
                  {selectedAchat.reference} • {selectedAchat.fournisseur?.nom} • {new Date(selectedAchat.date).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tableau des prix */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des prix...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <FiXCircle className="mx-auto text-4xl mb-3" />
          <p>{error}</p>
        </div>
      ) : prixList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiPackage className="mx-auto text-4xl text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">Aucun prix trouvé pour cet achat</p>
          <p className="text-sm text-gray-500 mt-1">Sélectionnez un autre achat ou ajoutez des prix</p>
        </div>
      ) : (
        <>
          {/* Résumé des prix */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600">Nombre de prix</div>
              <div className="text-2xl font-bold text-blue-800">{prixList.length}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-sm text-green-600">Quantité totale</div>
              <div className="text-2xl font-bold text-green-800">
                {prixList.reduce((sum, p) => sum + p.quantite, 0)}
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600">Montant total HT</div>
              <div className="text-2xl font-bold text-purple-800">
                {formatMontant(calculerTotalGeneral())}
              </div>
            </div>
          </div>

          {/* Tableau responsive */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">N°</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Désignation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Nature</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type Imprimante</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Marque</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Inventorié</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Parc</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Format Papier</th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Puissance Onduleur</th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Processeur</th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Disque</th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vitesse</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">RAM</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Écran</th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Écran Inv.</th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Système</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Unité</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Qté</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Prix HT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total HT</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prixList.map((prix, index) => (
                  <tr key={prix.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{prix.numeroPrix}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{prix.designation}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <span className="mr-1">{getNatureIcon(prix.nature)}</span>
                        {prix.nature || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{prix.typeImprimante || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{prix.marque || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {prix.inventorie ? (
                        <span className="text-green-600 flex items-center"><FiCheckCircle className="mr-1" size={14} /> Oui</span>
                      ) : (
                        <span className="text-gray-400">Non</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {prix.parc ? (
                        <span className="text-green-600 flex items-center"><FiCheckCircle className="mr-1" size={14} /> Oui</span>
                      ) : (
                        <span className="text-gray-400">Non</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{prix.formatPapier || '-'}</td>
                    {/* <td className="px-4 py-3 text-sm text-gray-700">{prix.puissanceOnduleur || '-'}</td> */}
                    <td className="px-4 py-3 text-sm text-gray-700">{prix.processeur || '-'}</td>
                    {/* <td className="px-4 py-3 text-sm text-gray-700">{prix.disque || '-'}</td> */}
                    <td className="px-4 py-3 text-sm text-gray-700">{prix.vitesse || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{prix.ram || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{prix.ecran || '-'}</td>
                    {/* <td className="px-4 py-3 text-sm">
                      {prix.ecranInventorie ? (
                        <span className="text-green-600 flex items-center"><FiCheckCircle className="mr-1" size={14} /> Oui</span>
                      ) : (
                        <span className="text-gray-400">Non</span>
                      )}
                    </td> */}
                    <td className="px-4 py-3 text-sm text-gray-700">{prix.systemeExploitation || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{prix.unite}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{prix.quantite}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{formatMontant(prix.prixUnitaireHT)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-700">
                      {formatMontant(prix.quantite * prix.prixUnitaireHT)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pied de tableau avec totaux et export */}
          <div className="mt-4 flex justify-between items-center bg-gray-100 p-4 rounded-lg">
            <div>
              <span className="text-gray-700 font-medium">Nombre de prix: </span>
              <span className="text-blue-600 font-bold">{prixList.length}</span>
              <span className="ml-4 text-gray-700 font-medium">Quantité totale: </span>
              <span className="text-blue-600 font-bold">
                {prixList.reduce((sum, p) => sum + p.quantite, 0)}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-gray-700 font-medium block">Total général HT</span>
                <span className="text-2xl font-bold text-green-700">
                  {formatMontant(calculerTotalGeneral())}
                </span>
                {selectedAchat && (
                  <span className="text-sm text-gray-600 block">
                    TVA {selectedAchat.tauxTva || 20}% : {formatMontant(calculerTotalGeneral() * (1 + (selectedAchat.tauxTva || 20) / 100))} TTC
                  </span>
                )}
              </div>
              
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <FiDownload className="mr-2" />
                Exporter Excel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConsultationPrixAchat;