import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiUser, FiCheckSquare, FiDownload, FiShoppingBag, FiSearch, FiX, FiChevronDown, FiCheck } from 'react-icons/fi';
import { getPriseEnChargeByAchat, getMaterielsAttribuesParAchatEtBeneficiaire } from '../../services/materialService';
import { getAchatById, getAllAchats } from '../../services/achatService';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import './PriseEnCharge.css';

const PriseEnCharge = () => {
  const { achatId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  const [downloading, setDownloading] = useState(false);
  
  const [achat, setAchat] = useState(null);
  const [achats, setAchats] = useState([]);
  const [priseEnCharge, setPriseEnCharge] = useState([]);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  const [materielsBeneficiaire, setMaterielsBeneficiaire] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllBeneficiaires, setShowAllBeneficiaires] = useState(true);
  const [selectedBeneficiaires, setSelectedBeneficiaires] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [qrCodes, setQrCodes] = useState({});

  // États pour le sélecteur d'achat
  const [showAchatDropdown, setShowAchatDropdown] = useState(false);
  const [achatSearch, setAchatSearch] = useState('');
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [selectedAchat, setSelectedAchat] = useState(null);

  // Charger la liste des achats pour le sélecteur
  useEffect(() => {
    const loadAchats = async () => {
      setLoadingFilters(true);
      try {
        const response = await getAllAchats();
        setAchats(response.data || []);
      } catch (error) {
        console.error('Erreur chargement achats:', error);
        toast.error('Erreur lors du chargement des achats');
      } finally {
        setLoadingFilters(false);
      }
    };
    loadAchats();
  }, []);

  // Charger les données de l'achat sélectionné
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        let currentAchatId = achatId;

        if (!currentAchatId) {
          const allAchatsRes = await getAllAchats();
          const allAchats = allAchatsRes.data || [];

          if (allAchats.length === 0) {
            toast.warning("Aucun achat disponible");
            setLoading(false);
            return;
          }

          const firstAchat = allAchats[0];
          currentAchatId = firstAchat.id;

          setSelectedAchat(firstAchat);
          setAchat(firstAchat);
        } else {
          const achatRes = await getAchatById(currentAchatId);
          setAchat(achatRes.data);
          setSelectedAchat(achatRes.data);
        }

        const priseEnChargeRes = await getPriseEnChargeByAchat(currentAchatId);
        setPriseEnCharge(priseEnChargeRes.data || []);

        // Générer les QR codes pour chaque bénéficiaire
        const qrCodesMap = {};
        for (const dto of priseEnChargeRes.data || []) {
          if (dto.beneficiaire && dto.materiels) {
            const numerosSerie = dto.materiels
              .map(m => m.numeroSerie)
              .filter(ns => ns && ns !== 'N/A');
            
            if (numerosSerie.length > 0) {
              const qrData = JSON.stringify({
                beneficiaire: `${dto.beneficiaire.nom} ${dto.beneficiaire.prenom}`,
                matricule: dto.beneficiaire.matricule,
                numerosSerie: numerosSerie,
                total: numerosSerie.length
              }, null, 2);
              
              try {
                qrCodesMap[dto.beneficiaire.id] = await QRCode.toDataURL(qrData, {
                  width: 120,
                  margin: 1,
                  color: {
                    dark: '#000000',
                    light: '#ffffff'
                  }
                });
              } catch (error) {
                console.error('Erreur génération QR code:', error);
              }
            }
          }
        }
        setQrCodes(qrCodesMap);

      } catch (error) {
        console.error("Erreur chargement données:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [achatId]);

  // Charger les matériels d'un bénéficiaire spécifique
  useEffect(() => {
    const loadMaterielsBeneficiaire = async () => {
      if (!selectedBeneficiaire) {
        setMaterielsBeneficiaire([]);
        return;
      }

      try {
        const materielsRes = await getMaterielsAttribuesParAchatEtBeneficiaire(
          achatId, 
          selectedBeneficiaire.id
        );
        setMaterielsBeneficiaire(materielsRes.data || []);
      } catch (error) {
        console.error('Erreur chargement matériels:', error);
        setMaterielsBeneficiaire([]);
      }
    };

    loadMaterielsBeneficiaire();
  }, [selectedBeneficiaire, achatId]);

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowAchatDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les achats
  const filteredAchats = achats.filter(achat => {
    const searchLower = achatSearch.toLowerCase();
    return (
      (achat.reference?.toLowerCase() || '').includes(searchLower) ||
      (achat.fournisseur?.nom?.toLowerCase() || '').includes(searchLower) ||
      (achat.numeroBonCommande?.toLowerCase() || '').includes(searchLower) ||
      (achat.description?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Sélectionner un achat
  const handleAchatSelect = (selectedAchat) => {
    setSelectedAchat(selectedAchat);
    setShowAchatDropdown(false);
    setAchatSearch('');
    navigate(`/prise-en-charge/${selectedAchat.id}`);
    // Réinitialiser les états
    setSelectedBeneficiaire(null);
    setSelectedBeneficiaires([]);
    setSelectionMode(false);
    setShowAllBeneficiaires(true);
  };

  // Effacer la sélection d'achat
  const clearAchatFilter = () => {
    setSelectedAchat(null);
    setAchatSearch('');
    navigate('/prise-en-charge');
  };

  // Sélectionner/Désélectionner tous les bénéficiaires
  const toggleSelectAll = () => {
    if (selectedBeneficiaires.length === priseEnCharge.length) {
      setSelectedBeneficiaires([]);
    } else {
      setSelectedBeneficiaires(priseEnCharge.map(dto => dto.beneficiaire?.id).filter(id => id));
    }
  };

  // Sélectionner/Désélectionner un bénéficiaire
  const toggleBeneficiaire = (beneficiaireId) => {
    if (selectedBeneficiaires.includes(beneficiaireId)) {
      setSelectedBeneficiaires(selectedBeneficiaires.filter(id => id !== beneficiaireId));
    } else {
      setSelectedBeneficiaires([...selectedBeneficiaires, beneficiaireId]);
    }
  };

  // FONCTION D'IMPRESSION
  const handlePrint = () => {
    const formsToPrint = getFormsToPrint();
    if (!formsToPrint) return;

    const printContent = generatePrintHTML(formsToPrint);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // FONCTION DE TÉLÉCHARGEMENT PDF EN PAYSAGE
  const handleDownloadPDF = async () => {
    const formsToPrint = getFormsToPrint();
    if (!formsToPrint) return;

    setDownloading(true);
    toast.info('Génération du PDF en cours...');

    try {
      // Créer un conteneur temporaire pour le PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '297mm'; // Largeur A4 paysage
      pdfContainer.style.backgroundColor = 'white';
      pdfContainer.style.padding = '10mm';
      pdfContainer.innerHTML = generatePrintHTML(formsToPrint, true);
      document.body.appendChild(pdfContainer);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Créer le PDF en orientation paysage
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const forms = pdfContainer.querySelectorAll('.prise-en-charge-form');
      
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        form.style.width = '277mm';
        
        const canvas = await html2canvas(form, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: false,
          useCORS: true,
          windowWidth: 1200,
          onclone: (clonedDoc) => {
            const clonedForms = clonedDoc.querySelectorAll('.prise-en-charge-form');
            clonedForms.forEach(f => {
              f.style.width = '277mm';
              f.style.margin = '0 auto';
            });
          }
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 277;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const xOffset = (297 - imgWidth) / 2;
        const yOffset = (210 - imgHeight) / 2;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, undefined, 'FAST');
      }

      const beneficiaireName = selectedBeneficiaire 
        ? `${selectedBeneficiaire.nom}_${selectedBeneficiaire.prenom}`
        : selectedBeneficiaires.length > 0 
          ? `${selectedBeneficiaires.length}_beneficiaires`
          : 'tous_beneficiaires';
      
      pdf.save(`prise_en_charge_${beneficiaireName}_${new Date().toISOString().split('T')[0]}.pdf`);

      document.body.removeChild(pdfContainer);
      toast.success('PDF téléchargé avec succès!');
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setDownloading(false);
    }
  };

  // Fonction utilitaire pour obtenir les formulaires à imprimer/télécharger
  const getFormsToPrint = () => {
    if (selectedBeneficiaire) {
      return [{
        beneficiaire: selectedBeneficiaire,
        materiels: materielsBeneficiaire
      }];
    } else if (selectionMode && selectedBeneficiaires.length > 0) {
      return priseEnCharge.filter(dto => 
        selectedBeneficiaires.includes(dto.beneficiaire?.id)
      );
    } else if (showAllBeneficiaires) {
      return priseEnCharge;
    } else {
      toast.warning('Veuillez sélectionner au moins un bénéficiaire');
      return null;
    }
  };

  // Générer le HTML pour l'impression/PDF
  const generatePrintHTML = (formsToPrint, isLandscape = false) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prise en charge</title>
        <meta charset="UTF-8">
        <style>
          ${getPrintStyles(isLandscape)}
        </style>
      </head>
      <body>
        ${formsToPrint.map((dto, index) => generateFormHTML(
          achat, 
          dto.beneficiaire, 
          dto.materiels, 
          index + 1,
          isLandscape,
          qrCodes[dto.beneficiaire?.id]
        )).join('')}
      </body>
      </html>
    `;
  };

  // Générer le HTML pour un formulaire
  const generateFormHTML = (achat, beneficiaire, materiels, numero, isLandscape = false, qrCodeUrl) => {
    const totalTTC = calculateTotalTTC(materiels);
    const today = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const materielsRows = materiels && materiels.length > 0 
      ? materiels.map(materiel => {
          const prixUnitaire = materiel.prix?.prixUnitaireHT || materiel.prix?.prixUnitaire || 0;
          return `
            <tr>
              <td class="text-center">${materiel.numeroInventaire || 'N/A'}</td>
              <td>
                <strong>${materiel.type?.designation || materiel.prix?.designation || 'N/A'}</strong><br>
                ${materiel.marque?.nom || materiel.prix?.marque || ''} ${materiel.prix?.modele || ''}
              </td>
              <td class="text-center">${materiel.numeroSerie || 'N/A'}</td>
              <td class="text-center">${materiel.prix?.unite || 'U'}</td>
              <td class="text-center">1</td>
              <td class="text-right">${formatMontant(prixUnitaire)}</td>
              <td class="text-right">${formatMontant(prixUnitaire)}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="7" class="text-center">Aucun matériel trouvé</td></tr>';

    const landscapeClass = isLandscape ? 'landscape-mode' : '';

    return `
      <div class="prise-en-charge-form ${landscapeClass}">
        <table class="form-header">
          <thead>
            <tr>
              <th colspan="7" class="title">PRISE EN CHARGE</th>
              <th>N°</th>
              <th>${numero}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="9" class="organization">ORMVAD - S.M.G./B.P.I.</td>
            </tr>
          </tbody>
        </table>

        <table class="form-section">
          <tbody>
            <tr>
              <td rowspan="2" class="section-label">
                <strong>ORIGINE :</strong><br>
                Marché :<br>
                Facture N° :
              </td>
              <td rowspan="2" class="section-value">
                ${achat?.reference || 'M 07/2025 DK-DPF'}
              </td>
              <td colspan="3" class="section-label">
                du ${formatDate(achat?.date) || '30/06/2025'} | BR ou DD N° :
              </td>
              <td colspan="4" class="section-value">
                Fournisseur : ${achat?.fournisseur?.nom || 'GADE MAY CONSO'}
              </td>
            </tr>
          </tbody>
        </table>

        <table class="form-section">
          <tbody>
            <tr>
              <td rowspan="2" class="section-label detenteur-cell" style="width: 25%;">
                <div>
                  <strong>LE DETENTEUR</strong>
                </div>
                <div class="detenteur-info">
                  Je soussigné : <strong>${beneficiaire?.nom?.toUpperCase()} ${beneficiaire?.prenom?.toUpperCase()}</strong><br>
                  Avoir pris en charge les articles ci-dessous
                </div>
              </td>
              <td class="section-value">
                Mle : ${beneficiaire?.matricule || '7950'}
              </td>
              <td class="section-value">
                C.A : ${beneficiaire?.affectation || ''}
              </td>
              <td class="section-value" colspan="2">
                DEP : ${beneficiaire?.departement || beneficiaire?.departementNom || 'DGR'}
              </td>
              <td class="section-value" colspan="2">
                SCE/BUR : ${beneficiaire?.service?.nom || beneficiaire?.serviceNom || beneficiaire?.bureau || ''}
              </td>
            </tr>
          </tbody>
        </table>

        <table class="form-table">
          <thead>
            <tr>
              <th class="col-inventaire">CODE INVENTAIRE</th>
              <th class="col-designation">DESIGNATION</th>
              <th class="col-serie">SERIE</th>
              <th class="col-ute">UTE</th>
              <th class="col-qte">QTE</th>
              <th class="col-prix">PRIX UNITAIRE</th>
              <th class="col-total">TOTAL TTC</th>
            </tr>
          </thead>
          <tbody>
            ${materielsRows}
            <tr class="total-row">
              <td colspan="6" class="text-right"><strong>TOTAL GÉNÉRAL</strong></td>
              <td class="text-right"><strong>${formatMontant(totalTTC)}</strong></td>
            </tr>
          </tbody>
        </table>

        <table class="form-footer">
          <tbody>
            <tr>
              <td class="footer-left">
                <div class="detenteur-signature">
                  ${qrCodeUrl ? (
                    `<div class="qr-code-container">
                      <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
                      <div class="signature-text">Signature</div>
                    </div>`
                  ) : (
                    `<>

                      <br />
                      <br />
                      <br />
                      Signature
                    </>`
                  )}
                </div>
              </td>
              <td class="footer-right">
                <div class="date-signature">
                  Fait à El Jadida le : ${today}<br>
                  <strong>SIGNATURE</strong><br>
                  <br>
                  <br>
                  <br>
                  <div class="signature-space"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  };

  // Styles pour l'impression/PDF
  const getPrintStyles = (isLandscape = false) => `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      background: white;
      padding: ${isLandscape ? '5mm' : '10mm'};
    }
    
    .prise-en-charge-form {
      border: 2px solid #000;
      margin-bottom: 20px;
      page-break-after: always;
      background: white;
      ${isLandscape ? 'width: 277mm; margin: 0 auto;' : ''}
    }
    
    .landscape-mode {
      font-size: ${isLandscape ? '12px' : '11px'};
    }
    
    .form-header,
    .form-section,
    .form-table,
    .form-footer {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
    }
    
    .form-header th,
    .form-header td,
    .form-section td,
    .form-table th,
    .form-table td,
    .form-footer td {
      border: 1px solid #000;
      padding: ${isLandscape ? '6px' : '8px'};
    }
    
    .title {
      font-size: ${isLandscape ? '18px' : '16px'};
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      padding: ${isLandscape ? '8px' : '10px'};
    }
    
    .organization {
      font-size: ${isLandscape ? '14px' : '12px'};
      text-align: left;
      padding: ${isLandscape ? '4px' : '5px'};
    }
    
    .section-label {
      font-size: ${isLandscape ? '12px' : '11px'};
      vertical-align: top;
    }
    
    .detenteur-cell {
      vertical-align: middle;
      text-align: center;
      padding: 10px !important;
    }
    
    .qr-code-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 5px;
    }
    
    .qr-code {
      width: ${isLandscape ? '70px' : '80px'};
      height: ${isLandscape ? '70px' : '80px'};
      border: 1px solid #ccc;
      margin-bottom: 5px;
    }
    
    .signature-text {
      font-size: ${isLandscape ? '10px' : '11px'};
      margin: 5px 0;
      font-style: italic;
      color: #333;
    }
    
    .detenteur-info {
      text-align: left;
      margin-top: 10px;
      font-size: ${isLandscape ? '11px' : '12px'};
      border-top: 1px dashed #ccc;
      padding-top: 8px;
    }
    
    .section-value {
      font-size: ${isLandscape ? '12px' : '11px'};
      vertical-align: top;
    }
    
    .fournisseur {
      display: block;
      margin-top: ${isLandscape ? '5px' : '10px'};
      text-align: left;
    }
    
    .form-table th {
      background: #f0f0f0;
      font-size: ${isLandscape ? '11px' : '10px'};
      text-transform: uppercase;
      text-align: center;
      padding: ${isLandscape ? '4px' : '6px'};
    }
    
    .form-table td {
      font-size: ${isLandscape ? '12px' : '11px'};
      padding: ${isLandscape ? '6px' : '8px'};
    }
    
    .col-inventaire { width: 15%; }
    .col-designation { width: 30%; }
    .col-serie { width: 15%; }
    .col-ute { width: 8%; }
    .col-qte { width: 8%; }
    .col-prix { width: 12%; }
    .col-total { width: 12%; }
    
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    
    .total-row {
      font-weight: bold;
      background: #f9f9f9;
    }
    
    .form-footer {
      border-top: 2px solid #000;
    }
    
    .footer-left,
    .footer-right {
      width: 50%;
      vertical-align: top;
      padding: ${isLandscape ? '15px' : '20px'};
    }
    
    .detenteur-signature,
    .date-signature {
      font-size: ${isLandscape ? '12px' : '11px'};
      min-height: 100px;
    }
    
    .signature-space {
      height: ${isLandscape ? '40px' : '60px'};
      border: 1px dashed #ccc;
      margin-top: ${isLandscape ? '5px' : '10px'};
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .qr-code {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  `;

  const calculateTotalTTC = (materiels) => {
    return materiels.reduce((total, m) => {
      const prixUnitaire = m.prix?.prixUnitaireHT || m.prix?.prixUnitaire || 0;
      return total + (prixUnitaire * 1);
    }, 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatMontant = (montant) => {
    return montant ? montant.toLocaleString('fr-MA', { minimumFractionDigits: 2 }) : '0.00';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement du formulaire...</p>
      </div>
    );
  }

  return (
    <div className="prise-en-charge-container">
      {/* Barre d'outils avec sélecteur de marché stylisé */}
      <div className="toolbar">
        <div className="space-y-3" style={{ width: '100%' }}>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
            Sélectionnez un achat
          </h3>
          
          <div className="relative dropdown-container">
            <button
              onClick={() => {
                setShowAchatDropdown(!showAchatDropdown);
              }}
              className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                selectedAchat 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <FiShoppingBag className="mr-3 text-blue-500" />
                <div>
                  {selectedAchat ? (
                    <>
                      <div className="font-medium text-gray-800">{selectedAchat.reference || `Achat #${selectedAchat.id}`}</div>
                      <div className="text-sm text-gray-600">
                        {selectedAchat.fournisseur?.nom || 'N/A'} • 
                        {selectedAchat.dateAchat ? ` ${new Date(selectedAchat.dateAchat).toLocaleDateString('fr-FR')}` : ''}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">Cliquez pour sélectionner un achat...</span>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {selectedAchat && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAchatFilter();
                    }}
                    className="mr-2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={18} />
                  </button>
                )}
                <FiChevronDown className={`transition-transform ${showAchatDropdown ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showAchatDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                <div className="p-3 border-b">
                  <div className="relative">
                    <input
                      type="text"
                      value={achatSearch}
                      onChange={(e) => setAchatSearch(e.target.value)}
                      placeholder="Rechercher une référence, fournisseur..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div className="py-2">
                  {loadingFilters ? (
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
                        <div className="font-medium text-gray-800">
                          {achat.reference || `Achat #${achat.id}`}
                          {achat.numeroBonCommande && ` (BC: ${achat.numeroBonCommande})`}
                        </div>
                        <div className="text-sm text-gray-600 flex justify-between mt-1">
                          <span>{achat.fournisseur?.nom || 'N/A'}</span>
                          <span>
                            {achat.dateAchat ? new Date(achat.dateAchat).toLocaleDateString('fr-FR') : 'N/A'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {achat.description ? achat.description.substring(0, 50) + (achat.description.length > 50 ? '...' : '') : 'Pas de description'}
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
                    {selectedAchat.reference || `Achat #${selectedAchat.id}`} • 
                    {selectedAchat.fournisseur?.nom ? ` ${selectedAchat.fournisseur.nom} •` : ''}
                    {selectedAchat.dateAchat ? ` ${new Date(selectedAchat.dateAchat).toLocaleDateString('fr-FR')}` : ''}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="toolbar-actions">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showAllBeneficiaires}
              onChange={(e) => {
                setShowAllBeneficiaires(e.target.checked);
                setSelectedBeneficiaire(null);
                setSelectionMode(false);
                setSelectedBeneficiaires([]);
              }}
            />
            Afficher tous les bénéficiaires
          </label>
          
          <button className="btn btn-primary" onClick={handlePrint}>
            <FiPrinter className="mr-2" /> Imprimer
          </button>

          <button 
            className="btn btn-danger" 
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            <FiDownload className="mr-2" /> 
            {downloading ? 'Génération...' : 'PDF Paysage'}
          </button>
          
          {showAllBeneficiaires && !selectionMode && (
            <button 
              className="btn btn-success" 
              onClick={() => {
                setSelectionMode(true);
                setSelectedBeneficiaires([]);
              }}
            >
              <FiCheckSquare className="mr-2" /> Sélection multiple
            </button>
          )}
          
          {selectionMode && (
            <>
              <button 
                className="btn btn-info" 
                onClick={toggleSelectAll}
              >
                {selectedBeneficiaires.length === priseEnCharge.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
              <button 
                className="btn btn-warning" 
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedBeneficiaires([]);
                }}
              >
                Annuler
              </button>
              <span className="selection-count">
                {selectedBeneficiaires.length} sélectionné(s)
              </span>
            </>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="content">
        {showAllBeneficiaires ? (
          priseEnCharge.map((dto, index) => {
            const beneficiaireId = dto.beneficiaire?.id;
            if (!beneficiaireId) return null;
            
            return (
              <div 
                key={beneficiaireId}
                className={`form-wrapper ${selectionMode ? 'selection-mode' : ''}`}
              >
                {selectionMode && (
                  <div className="selection-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedBeneficiaires.includes(beneficiaireId)}
                        onChange={() => toggleBeneficiaire(beneficiaireId)}
                      />
                      Sélectionner pour impression/PDF
                    </label>
                  </div>
                )}
                <PriseEnChargeForm
                  achat={achat}
                  beneficiaire={dto.beneficiaire}
                  materiels={dto.materiels}
                  numero={index + 1}
                  formatDate={formatDate}
                  formatMontant={formatMontant}
                  calculateTotalTTC={calculateTotalTTC}
                  qrCodeUrl={qrCodes[beneficiaireId]}
                />
              </div>
            );
          })
        ) : selectedBeneficiaire ? (
          <PriseEnChargeForm
            achat={achat}
            beneficiaire={selectedBeneficiaire}
            materiels={materielsBeneficiaire}
            numero={1}
            formatDate={formatDate}
            formatMontant={formatMontant}
            calculateTotalTTC={calculateTotalTTC}
            qrCodeUrl={qrCodes[selectedBeneficiaire.id]}
          />
        ) : (
          <div className="select-beneficiaire">
            <h2>Sélectionner un bénéficiaire</h2>
            <div className="beneficiaire-list">
              {priseEnCharge.map((dto) => (
                <button
                  key={dto.beneficiaire?.id}
                  className="beneficiaire-card"
                  onClick={() => {
                    setSelectedBeneficiaire(dto.beneficiaire);
                  }}
                >
                  <FiUser className="icon" />
                  <div className="info">
                    <h3>{dto.beneficiaire?.nom} {dto.beneficiaire?.prenom}</h3>
                    <p>Matricule: {dto.beneficiaire?.matricule || 'N/A'}</p>
                    <p>Matériels: {dto.materiels?.length || 0}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <button 
              className="btn btn-secondary mt-4"
              onClick={() => {
                setSelectedBeneficiaire(null);
                setShowAllBeneficiaires(true);
              }}
            >
              Afficher tous
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant Formulaire (pour l'affichage normal)
const PriseEnChargeForm = ({ 
  achat, 
  beneficiaire, 
  materiels, 
  numero, 
  formatDate, 
  formatMontant, 
  calculateTotalTTC,
  qrCodeUrl
}) => {
  const totalTTC = calculateTotalTTC(materiels);
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const getPrixUnitaire = (materiel) => {
    return materiel.prix?.prixUnitaireHT || materiel.prix?.prixUnitaire || 0;
  };

  return (
    <div className="prise-en-charge-form">
      <table className="form-header">
        <thead>
          <tr>
            <th colSpan="7" className="title">PRISE EN CHARGE</th>
            <th>N°</th>
            <th>{numero}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="9" className="organization">ORMVAD - S.M.G./B.P.I.</td>
          </tr>
        </tbody>
      </table>

      <table className="form-section">
        <tbody>
          <tr>
            <td rowSpan="2" className="section-label">
              <strong>ORIGINE :</strong><br />
              Marché :<br />
              Facture N° :
            </td>
            <td rowSpan="2" className="section-value">
              {achat?.reference || 'M 07/2025 DK-DPF'}
            </td>
            <td colSpan="3" className="section-label">
              du {formatDate(achat?.date) || '30/06/2025'} | BR ou DD N° :
            </td>
            <td colSpan="4" className="section-value">
                Fournisseur : {achat?.fournisseur?.nom || 'GADE MAY CONSO'}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="form-section">
        <tbody>
          <tr>
            <td rowSpan="2" className="section-label detenteur-cell" style={{ width: '25%' }}>

                <div>
                  <strong>LE DETENTEUR</strong>
                </div>
        
              <div className="detenteur-info">
                Je soussigné : <strong>{beneficiaire?.nom?.toUpperCase()} {beneficiaire?.prenom?.toUpperCase()}</strong><br />
                Avoir pris en charge les articles ci-dessous
              </div>
            </td>
            <td className="section-value">
              Mle : {beneficiaire?.matricule || '7950'}
            </td>
            <td className="section-value">
              C.A : {beneficiaire?.affectation || ''}
            </td>
            <td className="section-value" colSpan="2">
              DEP : {beneficiaire?.departement || beneficiaire?.departementNom || 'DGR'}
            </td>
            <td className="section-value" colSpan="2">
              SCE/BUR : {beneficiaire?.service?.nom || beneficiaire?.serviceNom || beneficiaire?.bureau || ''}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="form-table">
        <thead>
          <tr>
            <th className="col-inventaire">CODE INVENTAIRE</th>
            <th className="col-designation">DESIGNATION</th>
            <th className="col-serie">SERIE</th>
            <th className="col-ute">UTE</th>
            <th className="col-qte">QTE</th>
            <th className="col-prix">PRIX UNITAIRE</th>
            <th className="col-total">TOTAL TTC</th>
          </tr>
        </thead>
        <tbody>
          {materiels && materiels.length > 0 ? (
            materiels.map((materiel, index) => {
              const prixUnitaire = getPrixUnitaire(materiel);
              return (
                <tr key={materiel.id || index}>
                  <td className="text-center">{materiel.numeroInventaire || 'N/A'}</td>
                  <td>
                    <strong>{materiel.type?.designation || materiel.prix?.designation || 'N/A'}</strong><br />
                    {materiel.marque?.nom && <span>{materiel.marque.nom} </span>}
                    {materiel.prix?.marque && <span>{materiel.prix.marque} </span>}
                    {materiel.prix?.modele && <span>{materiel.prix.modele}</span>}
                  </td>
                  <td className="text-center">{materiel.numeroSerie || 'N/A'}</td>
                  <td className="text-center">{materiel.prix?.unite || 'U'}</td>
                  <td className="text-center">1</td>
                  <td className="text-right">{formatMontant(prixUnitaire)}</td>
                  <td className="text-right">{formatMontant(prixUnitaire)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="text-center">Aucun matériel trouvé</td>
            </tr>
          )}
          <tr className="total-row">
            <td colSpan="6" className="text-right"><strong>TOTAL GÉNÉRAL</strong></td>
            <td className="text-right"><strong>{formatMontant(totalTTC)}</strong></td>
          </tr>
        </tbody>
      </table>

      <table className="form-footer">
        <tbody>
          <tr>
            <td className="footer-left">
              <div className="detenteur-signature">
                {qrCodeUrl ? (
                  <div className="qr-code-container">
                    <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
                    
                  </div>
                ) : (
                  <>
                    
                    <br />
                    <br />
                    <br />
               
                  </>
                )}
              </div>
            </td>
            <td className="footer-right">
              <div className="date-signature">
                Fait à El Jadida le : {today}<br />
                <strong>SIGNATURE</strong><br />
                <br />
                <br />
                <br />
                <div className="signature-space"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PriseEnCharge;