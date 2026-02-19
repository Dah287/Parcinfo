import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiArrowLeft, FiUser, FiCheckSquare, FiDownload } from 'react-icons/fi';
import { getPriseEnChargeByAchat, getMaterielsAttribuesParAchatEtBeneficiaire } from '../../services/materialService';
import { getAchatById } from '../../services/achatService';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PriseEnCharge.css';

const PriseEnCharge = () => {
  const { achatId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  const [downloading, setDownloading] = useState(false);
  
  const [achat, setAchat] = useState(null);
  const [priseEnCharge, setPriseEnCharge] = useState([]);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  const [materielsBeneficiaire, setMaterielsBeneficiaire] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllBeneficiaires, setShowAllBeneficiaires] = useState(true);
  const [selectedBeneficiaires, setSelectedBeneficiaires] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const achatRes = await getAchatById(achatId);
        setAchat(achatRes.data);
        
        const priseEnChargeRes = await getPriseEnChargeByAchat(achatId);
        setPriseEnCharge(priseEnChargeRes.data || []);
        
      } catch (error) {
        console.error('Erreur chargement données:', error);
        toast.error('Erreur lors du chargement des données');
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

  // ✅ FONCTION DE TÉLÉCHARGEMENT PDF EN PAYSAGE
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
      pdfContainer.innerHTML = generatePrintHTML(formsToPrint, true); // true pour le mode paysage
      document.body.appendChild(pdfContainer);

      // Attendre que le contenu soit rendu
      await new Promise(resolve => setTimeout(resolve, 500));

      // Créer le PDF en orientation paysage
      const pdf = new jsPDF({
        orientation: 'landscape', // Orientation paysage
        unit: 'mm',
        format: 'a4'
      });

      const forms = pdfContainer.querySelectorAll('.prise-en-charge-form');
      
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        
        // Ajuster la largeur pour le paysage
        form.style.width = '277mm'; // Légèrement moins que 297mm pour les marges
        
        // Convertir le formulaire en canvas
        const canvas = await html2canvas(form, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: false,
          useCORS: true,
          windowWidth: 1200, // Largeur virtuelle pour le rendu
          onclone: (clonedDoc) => {
            // Ajuster les styles dans le clone
            const clonedForms = clonedDoc.querySelectorAll('.prise-en-charge-form');
            clonedForms.forEach(f => {
              f.style.width = '277mm';
              f.style.margin = '0 auto';
            });
          }
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Dimensions pour le paysage (A4 paysage: 297mm x 210mm)
        const imgWidth = 277; // mm (avec marge de 10mm de chaque côté)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Centrer l'image sur la page
        const xOffset = (297 - imgWidth) / 2;
        const yOffset = (210 - imgHeight) / 2;

        // Ajouter une nouvelle page si ce n'est pas la première
        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, undefined, 'FAST');
      }

      // Télécharger le PDF
      const beneficiaireName = selectedBeneficiaire 
        ? `${selectedBeneficiaire.nom}_${selectedBeneficiaire.prenom}`
        : selectedBeneficiaires.length > 0 
          ? `${selectedBeneficiaires.length}_beneficiaires`
          : 'tous_beneficiaires';
      
      pdf.save(`prise_en_charge_${beneficiaireName}_${new Date().toISOString().split('T')[0]}.pdf`);

      // Nettoyer
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

  // ✅ Générer le HTML pour l'impression/PDF (avec option paysage)
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
          isLandscape
        )).join('')}
      </body>
      </html>
    `;
  };

  // ✅ Générer le HTML pour un formulaire (avec adaptation paysage)
  const generateFormHTML = (achat, beneficiaire, materiels, numero, isLandscape = false) => {
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

    // Classes supplémentaires pour le mode paysage
    const landscapeClass = isLandscape ? 'landscape-mode' : '';

    return `
      <div class="prise-en-charge-form ${landscapeClass}">
        <!-- En-tête -->
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

        <!-- Origine -->
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
                DU ${achat?.reference || ''}
                <span class="fournisseur">Fournisseur : ${achat?.fournisseur?.nom || 'GADE MAY CONSO'}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Détenteur -->
        <table class="form-section">
          <tbody>
            <tr>
              <td rowspan="2" class="section-label">
                <strong>LE DETENTEUR</strong><br>
                Je soussigné : <strong>${beneficiaire?.nom?.toUpperCase()} ${beneficiaire?.prenom?.toUpperCase()}</strong><br>
                Avoir pris en charge les articles ci-dessous
              </td>
              <td class="section-value">
                Mle : ${beneficiaire?.matricule || '7950'}
              </td>
              <td class="section-value">
                C.A : ${beneficiaire?.affectation || ''}
              </td>
              <td class="section-value" colspan="2">
                BUR : ${beneficiaire?.bureau || ''}
              </td>
            </tr>
            <tr>
              <td class="section-value">
                DEP : ${beneficiaire?.departement || beneficiaire?.departementNom || 'DGR'}
              </td>
              <td class="section-value">
                SCE : ${beneficiaire?.service?.nom || beneficiaire?.serviceNom || ''}
              </td>
              <td class="section-value" colspan="2"></td>
            </tr>
          </tbody>
        </table>

        <!-- Tableau des matériels -->
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

        <!-- Pied de page -->
        <table class="form-footer">
          <tbody>
            <tr>
              <td class="footer-left">
                <div class="detenteur-signature">
                  <strong>LE DETENTEUR</strong><br>
                  <br>
                  <br>
                  <br>
                  Signature
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

  // ✅ Styles pour l'impression/PDF (avec adaptation paysage)
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
      width: 25%;
    }
    
    .section-value {
      font-size: ${isLandscape ? '12px' : '11px'};
      vertical-align: top;
    }
    
    .fournisseur {
      display: block;
      margin-top: ${isLandscape ? '5px' : '10px'};
      text-align: right;
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
    .col-designation { width: 35%; }
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
      {/* Barre d'outils */}
      <div className="toolbar">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <FiArrowLeft className="mr-2" /> Retour
        </button>
        
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

          {/* BOUTON PDF EN PAYSAGE */}
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

      {/* Contenu principal (affichage normal) */}
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
  calculateTotalTTC 
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
      {/* Même structure que generateFormHTML mais en JSX */}
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
              DU {achat?.reference || ''}
              <span className="fournisseur">Fournisseur : {achat?.fournisseur?.nom || 'GADE MAY CONSO'}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="form-section">
        <tbody>
          <tr>
            <td rowSpan="2" className="section-label">
              <strong>LE DETENTEUR</strong><br />
              Je soussigné : <strong>{beneficiaire?.nom?.toUpperCase()} {beneficiaire?.prenom?.toUpperCase()}</strong><br />
              Avoir pris en charge les articles ci-dessous
            </td>
            <td className="section-value">
              Mle : {beneficiaire?.matricule || '7950'}
            </td>
            <td className="section-value">
              C.A : {beneficiaire?.affectation || ''}
            </td>
            <td className="section-value" colSpan="2">
              BUR : {beneficiaire?.bureau || ''}
            </td>
          </tr>
          <tr>
            <td className="section-value">
              DEP : {beneficiaire?.departement || beneficiaire?.departementNom || 'DGR'}
            </td>
            <td className="section-value">
              SCE : {beneficiaire?.service?.nom || beneficiaire?.serviceNom || ''}
            </td>
            <td className="section-value" colSpan="2"></td>
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
                <strong>LE DETENTEUR</strong><br />
                <br />
                <br />
                <br />
                Signature
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