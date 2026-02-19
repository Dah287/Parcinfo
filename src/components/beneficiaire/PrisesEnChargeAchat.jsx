import React, { useState, useEffect } from 'react';
import { 
  FiDownload,
  FiSearch,
  FiRefreshCw,
  FiShoppingCart,
  FiUsers,
  FiCalendar,
  FiUser,
  FiPackage,
  FiXCircle,
  FiChevronDown,
  FiCheck,
  FiX,
  FiFileText
} from 'react-icons/fi';
import { getAllAchats } from '../../services/achatService';
import { getMaterielsByAchat } from '../../services/materialService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PrisesEnChargeAchat = () => {
  const [achats, setAchats] = useState([]);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAchats, setLoadingAchats] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);

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
      const response = await getMaterielsByAchat(achat.id);
      const tousMateriels = response.data || [];
      const materielsAttribues = tousMateriels.filter(m => m.beneficiaire !== null);
      setMateriels(materielsAttribues);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des matériels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchats = achats.filter(achat => 
    achat.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achat.fournisseur?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMontant = (montant) => {
    if (!montant && montant !== 0) return '0,00';
    return montant.toFixed(2).replace('.', ',');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const jour = date.getDate().toString().padStart(2, '0');
    const mois = (date.getMonth() + 1).toString().padStart(2, '0');
    const annee = date.getFullYear();
    return `${jour}/${mois}/${annee}`;
  };

  const getMaterielsParBeneficiaire = () => {
    const grouped = {};
    materiels.forEach(materiel => {
      if (materiel.beneficiaire) {
        const benefId = materiel.beneficiaire.id;
        if (!grouped[benefId]) {
          grouped[benefId] = {
            beneficiaire: materiel.beneficiaire,
            materiels: [],
            totalTTC: 0
          };
        }
        grouped[benefId].materiels.push(materiel);
        
        const prixHT = materiel.prix?.prixUnitaireHT || 0;
        const tauxTVA = selectedAchat?.tauxTva || 20;
        const prixTTC = prixHT * (1 + tauxTVA / 100);
        grouped[benefId].totalTTC += prixTTC;
      }
    });
    return Object.values(grouped);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const beneficiairesData = getMaterielsParBeneficiaire();

    beneficiairesData.forEach(({ beneficiaire, materiels }, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // En-tête ORMAD
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ORMAD', 14, 15);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('S.M.G./B.P.I.', 14, 22);

      // Ligne ORIGINE avec tableau
      const origineData = [
        ['ORIGINE :', 'Marché :', selectedAchat?.reference || '', 'du', formatDate(selectedAchat?.date), 'BR ou DD N° :', 'DU', 'Fournisseur :', selectedAchat?.fournisseur?.nom || '']
      ];

      autoTable(doc, {
        startY: 30,
        head: [],
        body: origineData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
          0: { cellWidth: 20, fontStyle: 'bold' },
          1: { cellWidth: 18 },
          2: { cellWidth: 35 },
          3: { cellWidth: 10 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 10 },
          7: { cellWidth: 25 },
          8: { cellWidth: 'auto' }
        }
      });

      // LE DETENTEUR
      let yPos = doc.lastAutoTable.finalY + 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('LE DETENTEUR', 14, yPos);
      
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`Je soussigné : ${beneficiaire.nom} ${beneficiaire.prenom || ''}`, 14, yPos);
      
      yPos += 7;
      doc.text(`Avoir pris en charge les articles ci-dessous`, 14, yPos);
      
      yPos += 7;
      doc.text(`Mle : ${beneficiaire.matricule || ''} DEP : ${beneficiaire.departement || ''} C.A SCE BUR`, 14, yPos);

      // Tableau des articles
      yPos += 10;
      
      const tableData = materiels.map(m => {
        const prixHT = m.prix?.prixUnitaireHT || 0;
        const tauxTVA = selectedAchat?.tauxTva || 20;
        const prixTTC = prixHT * (1 + tauxTVA / 100);
        
        // Désignation sur deux lignes si nécessaire
        const designation = m.prix?.designation || '';
        const designationCourte = designation.length > 25 ? designation.substring(0, 25) + '...' : designation;
        
        return [
          m.numeroInventaire || '',
          designationCourte,
          m.numeroSerie || '',
          '',
          m.quantite || '1',
          formatMontant(prixHT),
          formatMontant(prixTTC)
        ];
      });

      const totalBenefTTC = materiels.reduce((sum, m) => {
        const prixHT = m.prix?.prixUnitaireHT || 0;
        const tauxTVA = selectedAchat?.tauxTva || 20;
        return sum + (prixHT * (1 + tauxTVA / 100));
      }, 0);

      autoTable(doc, {
        startY: yPos,
        head: [['CODE INVENTAIRE', 'DESCRIPTION', 'SERIE', 'UTE', 'QTE', 'PRIX UNITAIRE', 'TOTAL TTC']],
        body: tableData,
        foot: [[
          '', '', '', '', '',
          { content: 'TOTAL TTC', colSpan: 1, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: formatMontant(totalBenefTTC), styles: { fontStyle: 'bold' } }
        ]],
        theme: 'grid',
        styles: { fontSize: 8, font: 'helvetica' },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 60 },
          2: { cellWidth: 28 },
          3: { cellWidth: 10 },
          4: { cellWidth: 10 },
          5: { cellWidth: 22 },
          6: { cellWidth: 22 }
        }
      });

      // Pied de page
      const finalY = doc.lastAutoTable.finalY + 15;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Fait à: El Jadida le : ${formatDate(new Date())}`, 14, finalY);
      doc.text('SIGNATURE', 160, finalY);
    });

    const fileName = selectedAchat 
      ? `prise_en_charge_${selectedAchat.reference.replace(/[^a-z0-9]/gi, '_')}.pdf`
      : 'prise_en_charge.pdf';
    
    doc.save(fileName);
  };

  const exportToExcel = () => {
    const beneficiairesData = getMaterielsParBeneficiaire();
    
    const excelData = [];
    
    // En-tête ORMAD
    excelData.push(['ORMAD', '', '', '', '', '', '', '', '']);
    excelData.push(['S.M.G./B.P.I.', '', '', '', '', '', '', '', '']);
    excelData.push([]);

    beneficiairesData.forEach(({ beneficiaire, materiels }) => {
      // Ligne ORIGINE
      excelData.push([
        'ORIGINE :',
        'Marché :',
        selectedAchat?.reference || '',
        'du',
        formatDate(selectedAchat?.date),
        'BR ou DD N° :',
        'DU',
        'Fournisseur :',
        selectedAchat?.fournisseur?.nom || ''
      ]);
      
      excelData.push([]);
      
      // LE DETENTEUR
      excelData.push(['LE DETENTEUR', '', '', '', '', '', '', '', '']);
      excelData.push([`Je soussigné : ${beneficiaire.nom} ${beneficiaire.prenom || ''}`, '', '', '', '', '', '', '', '']);
      excelData.push(['Avoir pris en charge les articles ci-dessous', '', '', '', '', '', '', '', '']);
      excelData.push([`Mle : ${beneficiaire.matricule || ''} DEP : ${beneficiaire.departement || ''} C.A SCE BUR`, '', '', '', '', '', '', '', '']);
      excelData.push([]);

      // En-têtes du tableau
      excelData.push(['CODE INVENTAIRE', 'DESCRIPTION', 'SERIE', 'UTE', 'QTE', 'PRIX UNITAIRE', 'TOTAL TTC', '', '']);

      // Matériels
      materiels.forEach(m => {
        const prixHT = m.prix?.prixUnitaireHT || 0;
        const tauxTVA = selectedAchat?.tauxTva || 20;
        const prixTTC = prixHT * (1 + tauxTVA / 100);

        excelData.push([
          m.numeroInventaire || '',
          m.prix?.designation || '',
          m.numeroSerie || '',
          '',
          m.quantite || '1',
          formatMontant(prixHT),
          formatMontant(prixTTC),
          '',
          ''
        ]);
      });

      // Total bénéficiaire
      const totalBenefTTC = materiels.reduce((sum, m) => {
        const prixHT = m.prix?.prixUnitaireHT || 0;
        const tauxTVA = selectedAchat?.tauxTva || 20;
        return sum + (prixHT * (1 + tauxTVA / 100));
      }, 0);

      excelData.push(['', '', '', '', '', 'TOTAL TTC', formatMontant(totalBenefTTC), '', '']);
      excelData.push([]);
      
      // Signature
      excelData.push([`Fait à: El Jadida le : ${formatDate(new Date())}`, '', '', '', '', '', '', '', '']);
      excelData.push(['SIGNATURE', '', '', '', '', '', '', '', '']);
      excelData.push([]);
      excelData.push([]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Fusionner les cellules pour le titre
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Fusionner ORMAD
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Fusionner S.M.G./B.P.I.
    ];

    // Ajuster la largeur des colonnes
    ws['!cols'] = [
      { wch: 18 }, { wch: 30 }, { wch: 18 }, { wch: 8 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Prises en charge');
    
    const fileName = selectedAchat 
      ? `prises_en_charge_${selectedAchat.reference.replace(/[^a-z0-9]/gi, '_')}.xlsx`
      : 'prises_en_charge.xlsx';
    
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiUsers className="mr-3 text-blue-600" />
          Prises en charge des bénéficiaires par achat
        </h2>
        <p className="text-gray-600 mt-1">
          Consultez et exportez la liste des matériels attribués aux bénéficiaires pour un achat
        </p>
      </div>

      {/* Sélecteur d'achat */}
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
                      {selectedAchat.fournisseur?.nom} • {formatDate(selectedAchat.date)}
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
                            {formatDate(achat.date)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {achat.type}
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

        {selectedAchat && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <FiCheck className="text-green-500 mr-2" />
              <div>
                <span className="font-medium text-green-800">Achat sélectionné:</span>
                <div className="text-sm text-green-700">
                  {selectedAchat.reference} • {selectedAchat.fournisseur?.nom} • {formatDate(selectedAchat.date)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des prises en charge...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <FiXCircle className="mx-auto text-4xl mb-3" />
          <p>{error}</p>
        </div>
      ) : materiels.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiUsers className="mx-auto text-4xl text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">Aucune prise en charge trouvée</p>
          <p className="text-sm text-gray-500 mt-1">
            Aucun matériel n'a été attribué à des bénéficiaires pour cet achat
          </p>
        </div>
      ) : (
        <>
          {/* Aperçu des bénéficiaires */}
          <div className="space-y-4 mb-6">
            {getMaterielsParBeneficiaire().map(({ beneficiaire, materiels }) => (
              <div key={beneficiaire.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800">
                  {beneficiaire.nom} {beneficiaire.prenom || ''}
                </h3>
                <div className="mt-2 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>Matricule: {beneficiaire.matricule || '-'}</div>
                  <div>Fonction: {beneficiaire.fonction || '-'}</div>
                  <div>Département: {beneficiaire.departement || '-'}</div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">{materiels.length}</span> matériel(s) pris en charge
                </div>
              </div>
            ))}
          </div>

          {/* Boutons d'export */}
          <div className="flex justify-end gap-3">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <FiFileText className="mr-2" />
              Exporter PDF (Format Prise en Charge)
            </button>
            
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <FiFileText className="mr-2" />
              Exporter Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PrisesEnChargeAchat;