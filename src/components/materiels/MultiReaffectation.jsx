import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiPackage, 
  FiCheck, 
  FiSearch, 
  FiX, 
  FiInfo, 
  FiChevronDown,
  FiRefreshCw,
  FiArrowRight,
  FiList
} from 'react-icons/fi';
import { 
  reaffecterMateriel, 
  getMaterielsByBeneficiaire,
  getMaterielsDisponibles
} from '../../services/materialService';
import { getAllBeneficiaires } from '../../services/beneficiareService';
import { toast } from 'react-toastify';
// ✅ Nouvel import explicite
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';  // ← Import direct du plugin


const MultiReaffectation = () => {
  // États pour les bénéficiaires
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [sourceBeneficiaire, setSourceBeneficiaire] = useState(null);
  const [destinationBeneficiaire, setDestinationBeneficiaire] = useState(null);
  
  // États pour les matériels
  const [materielsSource, setMaterielsSource] = useState([]);
  const [materielsSelectionnes, setMaterielsSelectionnes] = useState([]);
  
  // États pour les dropdowns
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  
  // États de chargement
  const [loadingBeneficiaires, setLoadingBeneficiaires] = useState(true);
  const [loadingMateriels, setLoadingMateriels] = useState(false);
  const [loadingReaffectation, setLoadingReaffectation] = useState(false);
  
  // Date et observations
  const [dateReaffectation, setDateReaffectation] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');

// Après les autres useState
const [lastReaffectationResult, setLastReaffectationResult] = useState(null);
const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Charger les bénéficiaires
  useEffect(() => {
    const loadBeneficiaires = async () => {
      try {
        setLoadingBeneficiaires(true);
        const response = await getAllBeneficiaires();
        setBeneficiaires(response.data || []);
      } catch (error) {
        console.error('Erreur chargement bénéficiaires:', error);
        toast.error('Erreur lors du chargement des bénéficiaires');
      } finally {
        setLoadingBeneficiaires(false);
      }
    };

    loadBeneficiaires();
  }, []);

  // Charger les matériels du bénéficiaire source quand il est sélectionné
  useEffect(() => {
    const loadMaterielsSource = async () => {
      if (!sourceBeneficiaire) {
        setMaterielsSource([]);
        return;
      }

      try {
        setLoadingMateriels(true);
        const response = await getMaterielsByBeneficiaire(sourceBeneficiaire.id);
        setMaterielsSource(response.data || []);
        // Réinitialiser la sélection des matériels
        setMaterielsSelectionnes([]);
      } catch (error) {
        console.error('Erreur chargement matériels:', error);
        toast.error('Erreur lors du chargement des matériels du bénéficiaire');
      } finally {
        setLoadingMateriels(false);
      }
    };

    loadMaterielsSource();
  }, [sourceBeneficiaire]);

  // Filtrer les bénéficiaires
  const filteredSourceBeneficiaires = beneficiaires.filter(beneficiaire => {
    const searchLower = sourceSearch.toLowerCase();
    return (
      (beneficiaire.nom && beneficiaire.nom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.prenom && beneficiaire.prenom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.matricule && beneficiaire.matricule.toLowerCase().includes(searchLower)) ||
      (beneficiaire.email && beneficiaire.email.toLowerCase().includes(searchLower))
    );
  });

  const filteredDestinationBeneficiaires = beneficiaires.filter(beneficiaire => {
    // Exclure le bénéficiaire source de la liste destination
    if (sourceBeneficiaire && beneficiaire.id === sourceBeneficiaire.id) return false;
    
    const searchLower = destinationSearch.toLowerCase();
    return (
      (beneficiaire.nom && beneficiaire.nom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.prenom && beneficiaire.prenom.toLowerCase().includes(searchLower)) ||
      (beneficiaire.matricule && beneficiaire.matricule.toLowerCase().includes(searchLower)) ||
      (beneficiaire.email && beneficiaire.email.toLowerCase().includes(searchLower))
    );
  });

  // Gérer la sélection/désélection des matériels
  const toggleMaterielSelection = (materiel) => {
    setMaterielsSelectionnes(prev => {
      const isSelected = prev.some(m => m.id === materiel.id);
      if (isSelected) {
        return prev.filter(m => m.id !== materiel.id);
      } else {
        return [...prev, materiel];
      }
    });
  };

  const selectAllMateriels = () => {
    setMaterielsSelectionnes([...materielsSource]);
  };

  const deselectAllMateriels = () => {
    setMaterielsSelectionnes([]);
  };

  // Soumettre la réaffectation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sourceBeneficiaire || !destinationBeneficiaire) {
      toast.warning('Veuillez sélectionner les bénéficiaires source et destination');
      return;
    }

    if (materielsSelectionnes.length === 0) {
      toast.warning('Veuillez sélectionner au moins un matériel à transférer');
      return;
    }

    if (sourceBeneficiaire.id === destinationBeneficiaire.id) {
      toast.warning('Le bénéficiaire source et destination doivent être différents');
      return;
    }

    try {
      setLoadingReaffectation(true);
      
      // Réaffecter chaque matériel sélectionné
      const promises = materielsSelectionnes.map(materiel => {
        const dto = {
          materielId: materiel.id,
          beneficiaireId: destinationBeneficiaire.id,
          dateAttribution: dateReaffectation,
          observations: observations
        };
        return reaffecterMateriel(dto);
      });

      const results = await Promise.all(promises);
      
// Dans le bloc try, après les résultats :
toast.success(`${results.length} matériel(s) transféré(s) avec succès !`);

// Stocker les données pour le PV
setLastReaffectationResult({
  source: { ...sourceBeneficiaire },
  destination: { ...destinationBeneficiaire },
  materiels: [...materielsSelectionnes],
  date: dateReaffectation,
  observations: observations
});

setShowPdfPreview(true);

// Recharger les matériels du bénéficiaire source
if (sourceBeneficiaire) {
  const response = await getMaterielsByBeneficiaire(sourceBeneficiaire.id);
  setMaterielsSource(response.data || []);
}
      
      // Réinitialiser le formulaire
      resetForm();
      
      // Recharger les matériels du bénéficiaire source
      if (sourceBeneficiaire) {
        const response = await getMaterielsByBeneficiaire(sourceBeneficiaire.id);
        setMaterielsSource(response.data || []);
      }
      
    } catch (error) {
      console.error('Erreur réaffectation:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du transfert des matériels');
    } finally {
      setLoadingReaffectation(false);
    }
  };
// Génère le PV de changement en PDF
// Génère le PV de changement en PDF - Version corrigée
// Génère le PV de changement au format ORMVAD/SMG-BPI
const generatePVChangementPDF = () => {
  if (!lastReaffectationResult) {
    toast.warning('Aucune réaffectation récente à imprimer');
    return;
  }

  const { source, destination, materiels, date, observations } = lastReaffectationResult;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // ==========================================
  // HEADER
  // ==========================================
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("ORMVAD", 14, 15);
  doc.setFont("helvetica", "normal");
  doc.text("SMG/BPI", 14, 21);
  
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(pageWidth - 35, 10, 25, 8);
  doc.setFontSize(10);
  doc.text("N°", pageWidth - 22, 16);
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const titleText = "PROCES VERBAL DE CHANGEMENT";
  const titleWidth = doc.getTextWidth(titleText);
  const titleX = (pageWidth - titleWidth) / 2;
  doc.text(titleText, titleX, 35);
  doc.setLineWidth(0.5);
  doc.rect(titleX - 3, 26, titleWidth + 6, 12);
  
  // ==========================================
  // PARTIES SECTION
  // ==========================================
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Entre les soussignés :", 14, 50);
  
  // Helper pour formater les noms
  const formatNomComplet = (nom, prenom) => {
    if (nom && prenom) return `${nom.toUpperCase()} ${prenom.toUpperCase()}`;
    if (nom) return nom.toUpperCase();
    return "........................";
  };
  
  // L'Expéditeur (Source)
  doc.setFont("helvetica", "bold");
  doc.text("L'Expéditeur :", 20, 60);
  doc.setFont("helvetica", "normal");
  
  const sourceNomComplet = formatNomComplet(source.nom, source.prenom);
  const sourceDepartement = source.departement?.nom || source.service?.nom || "...........";
  
  doc.text(sourceNomComplet, 50, 60);
  doc.text(`Matricule : ${source.matricule || "..............."}`, 50, 67);
  doc.text("Code Analytique : ...............", 90, 67);
  doc.text(`Local. : ${sourceDepartement}`, 150, 67);
  
  doc.setFont("helvetica", "italic");
  doc.text("D'UNE PART", pageWidth - 35, 73);
  
  // Le Preneur (Destination)
  doc.setFont("helvetica", "bold");
  doc.text("Le Preneur :", 20, 83);
  doc.setFont("helvetica", "normal");
  
  const destNomComplet = formatNomComplet(destination.nom, destination.prenom);
  const destDepartement = destination.departement?.nom || destination.service?.nom || "...........";
  
  doc.text(destNomComplet, 50, 83);
  doc.text(`Matricule : ${destination.matricule || "..............."}`, 50, 90);
  doc.text("Code Analytique : ...............", 90, 90);
  doc.text(`Local. : ${destDepartement}`, 150, 90);
  
  doc.setFont("helvetica", "italic");
  doc.text("D'AUTRE PART", pageWidth - 35, 96);
  
  // Intro text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Le preneur soussigné avoir pris en charge les articles ci-dessous", 14, 106);
  
  // ==========================================
  // TABLE - MULTI MATÉRIELS
  // ==========================================
  const tableColumn = [
    "Code Inventaire Origine",
    "Désignation",
    "Uté",
    "Qté",
    "Prix Unitaire",
    "Code Inventaire Nouveau"
  ];
  
  const tableRows = materiels.map(materiel => {
    // Formatage de la désignation avec type + numéro de série
    const designation = `${materiel.type?.designation || 'N/A'}\nNS: ${materiel.numeroSerie || ''}`;
    
    // Formatage du prix (adaptez selon votre structure de données)
    const prixUnitaire = materiel.prix?.montant 
      ? `${materiel.prix.montant.toLocaleString('fr-FR')} DH` 
      : (materiel.prixAchat ? `${materiel.prixAchat} DH` : "");
    
    return [
      materiel.numeroInventaire || "",           // Code Inventaire Origine
      designation,                                // Désignation avec saut de ligne
      "U",                                        // Uté (unité)
      "01",                                       // Qté (toujours 1 par ligne)
      prixUnitaire,                               // Prix Unitaire
      ""                                          // Code Inventaire Nouveau (vide comme demandé)
    ];
  });
  
  autoTable(doc, {
    startY: 110,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    styles: { 
      fontSize: 9, 
      cellPadding: 3,
      font: 'helvetica',
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      cellWidth: 'auto',
      overflow: 'linebreak'  // Permet le saut de ligne dans les cellules
    },
    headStyles: { 
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.5
    },
    bodyStyles: { 
      textColor: [0, 0, 0],
      valign: 'top'  // Alignement haut pour les cellules multi-lignes
    },
    columnStyles: {
      0: { cellWidth: 38, halign: 'center' }, // Code Inventaire Origine
      1: { cellWidth: 62, halign: 'left' },   // Désignation (plus large pour le texte)
      2: { cellWidth: 15, halign: 'center' }, // Uté
      3: { cellWidth: 15, halign: 'center' }, // Qté
      4: { cellWidth: 25, halign: 'right' },  // Prix Unitaire
      5: { cellWidth: 38, halign: 'center' }  // Code Inventaire Nouveau
    },
    margin: { left: 10, right: 10 },
    didParseCell: (data) => {
      // Ajout d'un saut de ligne automatique dans la colonne Désignation
      if (data.column.index === 1 && data.cell.raw) {
        data.cell.styles.minCellHeight = 15; // Hauteur minimale pour 2 lignes
      }
    }
  });
  
  // ==========================================
  // FOOTER SECTION
  // ==========================================
  const finalY = doc.lastAutoTable?.finalY || 150;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Etat des articles Mutés :", 14, finalY + 10);
  doc.setLineWidth(0.25);
  doc.setDrawColor(150);
  doc.line(50, finalY + 10, pageWidth - 20, finalY + 10);
  doc.line(14, finalY + 18, pageWidth - 20, finalY + 18);
  doc.line(14, finalY + 26, pageWidth - 20, finalY + 26);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(80);
  
  const notaText1 = "NOTA : Aucun mouvement de mobilier ou de matériel ne peut être effectué sans avis préalable du responsable du patrimoine.";
  const notaText2 = "En cas de perte le détenteur de l'objet se trouve dans l'obligation de le remplacer.";
  
  doc.text(notaText1, 14, finalY + 38, { maxWidth: pageWidth - 34 });
  doc.text(notaText2, 14, finalY + 43, { maxWidth: pageWidth - 34 });
  
  doc.setTextColor(0);
  
  // Date avec observations si présentes
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const dateStr = date ? new Date(date).toLocaleDateString('fr-FR') : '.../.../......';
  doc.text(`Fait à : .................... Le ${dateStr}`, 14, finalY + 55);
  
  // Affichage des observations si présentes
  if (observations) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text(`Obs. : ${observations}`, 14, finalY + 62, { maxWidth: pageWidth - 34 });
  }
  
  // ==========================================
  // SIGNATURE SECTIONS
  // ==========================================
  const signY = finalY + (observations ? 75 : 70);
  const signWidth = 45;
  
  doc.setLineWidth(0.25);
  doc.setDrawColor(0);
  
  // L'EXPEDITEUR
  doc.line(14, signY, 14 + signWidth, signY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("L'EXPEDITEUR", 14 + signWidth/2, signY + 8, { align: 'center' });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(sourceNomComplet, 14 + signWidth/2, signY + 14, { align: 'center' });
  
  // LE REPRESENTANT DU BPI
  const middleX = pageWidth / 2;
  doc.line(middleX - signWidth/2, signY, middleX + signWidth/2, signY);
  doc.text("LE REPRESENTANT DU BPI", middleX, signY + 8, { align: 'center' });
  doc.setFontSize(8);
  doc.text("Vu et approuvé", middleX, signY + 14, { align: 'center' });
  
  // LE PRENEUR
  const rightX = pageWidth - 20 - signWidth;
  doc.line(rightX, signY, rightX + signWidth, signY);
  doc.text("LE PRENEUR", rightX + signWidth/2, signY + 8, { align: 'center' });
  doc.setFontSize(8);
  doc.text(destNomComplet, rightX + signWidth/2, signY + 14, { align: 'center' });
  
  // ==========================================
  // SAVE PDF
  // ==========================================
  const fileName = `PV_Changement_${date}_${source.matricule || 'source'}_vers_${destination.matricule || 'dest'}.pdf`;
  doc.save(fileName);
  
  toast.success('PV de changement téléchargé avec succès !');
};
  const resetForm = () => {
    setSourceBeneficiaire(null);
    setDestinationBeneficiaire(null);
    setMaterielsSelectionnes([]);
    setDateReaffectation(new Date().toISOString().split('T')[0]);
    setObservations('');
    setSourceSearch('');
    setDestinationSearch('');
    setShowSourceDropdown(false);
    setShowDestinationDropdown(false);
  };

  // Rendu
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-purple-100 p-3 rounded-lg mr-4">
            <FiRefreshCw className="text-purple-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Transfert Multi-Matériels</h2>
            <p className="text-gray-600">Transférer un ou plusieurs matériels d'un bénéficiaire à un autre</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Bénéficiaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Bénéficiaire Source */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-red-100 text-red-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
                Bénéficiaire Source
              </h3>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowSourceDropdown(!showSourceDropdown);
                    setShowDestinationDropdown(false);
                  }}
                  className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                    sourceBeneficiaire 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <FiUser className="mr-3 text-red-500" />
                    <div>
                      {sourceBeneficiaire ? (
                        <>
                          <div className="font-medium text-gray-800">
                            {sourceBeneficiaire.nom} {sourceBeneficiaire.prenom}
                          </div>
                          <div className="text-sm text-gray-600">
                            {sourceBeneficiaire.matricule ? `${sourceBeneficiaire.matricule} • ` : ''}
                            {sourceBeneficiaire.departement?.nom || sourceBeneficiaire.service?.nom || 'N/A'}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">Sélectionner le bénéficiaire source</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {sourceBeneficiaire && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSourceBeneficiaire(null);
                          setMaterielsSource([]);
                          setMaterielsSelectionnes([]);
                          setSourceSearch('');
                        }}
                        className="mr-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={18} />
                      </button>
                    )}
                    <FiChevronDown className={`transition-transform ${showSourceDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showSourceDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <input
                          type="text"
                          value={sourceSearch}
                          onChange={(e) => setSourceSearch(e.target.value)}
                          placeholder="Rechercher un bénéficiaire..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {loadingBeneficiaires ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Chargement...</p>
                        </div>
                      ) : filteredSourceBeneficiaires.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Aucun bénéficiaire trouvé
                        </div>
                      ) : (
                        filteredSourceBeneficiaires.map(beneficiaire => (
                          <div
                            key={beneficiaire.id}
                            onClick={() => {
                              setSourceBeneficiaire(beneficiaire);
                              setShowSourceDropdown(false);
                              setSourceSearch('');
                            }}
                            className={`px-4 py-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              sourceBeneficiaire?.id === beneficiaire.id ? 'bg-red-50' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-800">
                              {beneficiaire.nom} {beneficiaire.prenom}
                            </div>
                            <div className="text-sm text-gray-600 flex justify-between mt-1">
                              <span>{beneficiaire.matricule || 'Sans matricule'}</span>
                              <span>{beneficiaire.departement?.nom || 'N/A'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {sourceBeneficiaire && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <FiInfo className="text-red-500 mr-2" />
                    <div className="text-sm text-red-700">
                      Matériels attribués: {materielsSource.length}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bénéficiaire Destination */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
                Bénéficiaire Destination
              </h3>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowDestinationDropdown(!showDestinationDropdown);
                    setShowSourceDropdown(false);
                  }}
                  className={`w-full p-4 border rounded-xl text-left flex justify-between items-center transition-all ${
                    destinationBeneficiaire 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <FiUser className="mr-3 text-green-500" />
                    <div>
                      {destinationBeneficiaire ? (
                        <>
                          <div className="font-medium text-gray-800">
                            {destinationBeneficiaire.nom} {destinationBeneficiaire.prenom}
                          </div>
                          <div className="text-sm text-gray-600">
                            {destinationBeneficiaire.matricule ? `${destinationBeneficiaire.matricule} • ` : ''}
                            {destinationBeneficiaire.departement?.nom || destinationBeneficiaire.service?.nom || 'N/A'}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">Sélectionner le bénéficiaire destination</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {destinationBeneficiaire && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDestinationBeneficiaire(null);
                          setDestinationSearch('');
                        }}
                        className="mr-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={18} />
                      </button>
                    )}
                    <FiChevronDown className={`transition-transform ${showDestinationDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showDestinationDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <input
                          type="text"
                          value={destinationSearch}
                          onChange={(e) => setDestinationSearch(e.target.value)}
                          placeholder="Rechercher un bénéficiaire..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {loadingBeneficiaires ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Chargement...</p>
                        </div>
                      ) : filteredDestinationBeneficiaires.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Aucun bénéficiaire trouvé
                        </div>
                      ) : (
                        filteredDestinationBeneficiaires.map(beneficiaire => (
                          <div
                            key={beneficiaire.id}
                            onClick={() => {
                              setDestinationBeneficiaire(beneficiaire);
                              setShowDestinationDropdown(false);
                              setDestinationSearch('');
                            }}
                            className={`px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              destinationBeneficiaire?.id === beneficiaire.id ? 'bg-green-50' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-800">
                              {beneficiaire.nom} {beneficiaire.prenom}
                            </div>
                            <div className="text-sm text-gray-600 flex justify-between mt-1">
                              <span>{beneficiaire.matricule || 'Sans matricule'}</span>
                              <span>{beneficiaire.departement?.nom || 'N/A'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Matériels du bénéficiaire source */}
          {sourceBeneficiaire && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">3</span>
                  Matériels de {sourceBeneficiaire.nom} {sourceBeneficiaire.prenom}
                </h3>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={selectAllMateriels}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllMateriels}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>

              {loadingMateriels ? (
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Chargement des matériels...</p>
                </div>
              ) : materielsSource.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                  <p className="text-yellow-700">Ce bénéficiaire n'a aucun matériel attribué</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materielsSource.map(materiel => {
                    const isSelected = materielsSelectionnes.some(m => m.id === materiel.id);
                    
                    return (
                      <div
                        key={materiel.id}
                        onClick={() => toggleMaterielSelection(materiel)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`mr-3 mt-1 w-5 h-5 border rounded flex items-center justify-center ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <FiCheck className="text-white text-xs" />}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div className="font-medium text-gray-800">
                                {materiel.numeroInventaire || `Matériel #${materiel.id}`}
                              </div>
                              {materiel.type && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  {materiel.type.designation}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>{materiel.marque?.nom || 'N/A'}</span>
                                <span>{materiel.numeroSerie || 'N/A'}</span>
                              </div>
                              
                              {materiel.caracteristiques && (
                                <div className="mt-1 text-xs text-gray-500 truncate">
                                  {Object.entries(materiel.caracteristiques)
                                    .slice(0, 2)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Résumé de sélection */}
              {materielsSelectionnes.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center">
                    <FiList className="text-blue-500 mr-2" />
                    <span className="font-medium text-blue-800">
                      {materielsSelectionnes.length} matériel(s) sélectionné(s) pour le transfert
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-blue-700">
                    {materielsSelectionnes.map(m => m.numeroInventaire || `#${m.id}`).join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Date et observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-purple-100 text-purple-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">4</span>
                Date de transfert
              </h3>
              <input
                type="date"
                value={dateReaffectation}
                onChange={(e) => setDateReaffectation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-purple-100 text-purple-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">5</span>
                Observations
              </h3>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observations sur le transfert..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={loadingReaffectation}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loadingReaffectation || materielsSelectionnes.length === 0 || !sourceBeneficiaire || !destinationBeneficiaire}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loadingReaffectation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Transfert en cours...
                </>
              ) : (
                <>
                  <FiArrowRight className="mr-2" />
                  Transférer {materielsSelectionnes.length} matériel(s)
                </>
              )}
            </button>
          </div>
          {/* Bouton d'impression PDF - affiché après succès */}
{showPdfPreview && lastReaffectationResult && (
  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center">
        <FiCheck className="text-green-600 mr-2" />
        <span className="font-medium text-green-800">
          ✓ {lastReaffectationResult.materiels.length} matériel(s) transféré(s)
        </span>
      </div>
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={generatePVChangementPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Télécharger le PV (PDF)
        </button>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowPdfPreview(false);
            setLastReaffectationResult(null);
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Nouvelle opération
        </button>
      </div>
    </div>
  </div>
)}
        </form>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <FiUser className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bénéficiaire Source</p>
              <p className="text-lg font-bold text-gray-800">
                {sourceBeneficiaire ? `${sourceBeneficiaire.nom} ${sourceBeneficiaire.prenom}` : 'Non sélectionné'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <FiUser className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bénéficiaire Destination</p>
              <p className="text-lg font-bold text-gray-800">
                {destinationBeneficiaire ? `${destinationBeneficiaire.nom} ${destinationBeneficiaire.prenom}` : 'Non sélectionné'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FiPackage className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Matériels Source</p>
              <p className="text-2xl font-bold text-gray-800">{materielsSource.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <FiRefreshCw className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">À transférer</p>
              <p className="text-2xl font-bold text-gray-800">{materielsSelectionnes.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiReaffectation;