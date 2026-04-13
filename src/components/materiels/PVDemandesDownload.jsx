// components/materiels/PVDemandesDownload.jsx
import React, { useState, useEffect } from 'react';
import {
  FiDownload,
  FiFileText,
  FiCheckCircle,
  FiSearch,
  FiCalendar,
  FiUser,
  FiPackage,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
  FiPrinter
} from 'react-icons/fi';
import { getAllDemandes } from '../../services/reaffectationValidationService';
import { getCurrentUser } from '../../services/authService';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PVDemandesDownload = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedDemandes, setSelectedDemandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('toutes');
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadDemandes();
  }, []);

  const loadDemandes = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (user && user.id) {
        const demandesData = await getAllDemandes(user.id);
        const demandesValidees = demandesData.filter(d => d.statut === 'VALIDEE');
        setDemandes(demandesValidees);
      }
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDemandes = () => {
    let filtered = demandes;

    if (filter === 'mois') {
      const unMoisAgo = new Date();
      unMoisAgo.setMonth(unMoisAgo.getMonth() - 1);
      filtered = filtered.filter(d => new Date(d.dateValidation) >= unMoisAgo);
    } else if (filter === 'semaine') {
      const uneSemaineAgo = new Date();
      uneSemaineAgo.setDate(uneSemaineAgo.getDate() - 7);
      filtered = filtered.filter(d => new Date(d.dateValidation) >= uneSemaineAgo);
    } else if (filter === 'aujourdhui') {
      const aujourdhui = new Date().toDateString();
      filtered = filtered.filter(d => new Date(d.dateValidation).toDateString() === aujourdhui);
    }

    if (dateRange.start) {
      filtered = filtered.filter(d => new Date(d.dateValidation) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(d => new Date(d.dateValidation) <= new Date(dateRange.end));
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.id?.toString().includes(searchTerm) ||
        d.beneficiaireSource?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.beneficiaireDestination?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredDemandes = getFilteredDemandes();

  // Récupérer la liste des matériels d'une demande
  const getMaterielsList = (demande) => {
    let materielsList = [];
    if (demande.materiels && Array.isArray(demande.materiels) && demande.materiels.length > 0) {
      materielsList = demande.materiels;
    } else if (demande.materiel) {
      materielsList = [demande.materiel];
    }
    return materielsList;
  };

  // Formatage des noms complets
  const formatNomComplet = (nom, prenom) => {
    if (nom && prenom) return `${nom.toUpperCase()} ${prenom.toUpperCase()}`;
    if (nom) return nom.toUpperCase();
    return "........................";
  };

  // ✅ GÉNÉRATION DU PV - VERSION PROCES VERBAL DE CHANGEMENT
  const generatePVChangementPDF = (demande, materiels, source, destination, dateTransfert, observations) => {
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
      
      // Formatage du prix
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
        overflow: 'linebreak'
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
        valign: 'top'
      },
      columnStyles: {
        0: { cellWidth: 38, halign: 'center' },
        1: { cellWidth: 62, halign: 'left' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 38, halign: 'center' }
      },
      margin: { left: 10, right: 10 },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.cell.raw) {
          data.cell.styles.minCellHeight = 15;
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
    const dateStr = dateTransfert ? new Date(dateTransfert).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
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
    const fileName = `PV_Changement_${dateStr}_${source.matricule || 'source'}_vers_${destination.matricule || 'dest'}.pdf`;
    doc.save(fileName);
    toast.success('PV de changement téléchargé avec succès !');
  };

  // Générer un seul PV
  const generateSinglePV = (demande) => {
    const materielsList = getMaterielsList(demande);
    if (materielsList.length === 0) {
      toast.error('Aucun matériel trouvé pour cette demande');
      return;
    }
    
    generatePVChangementPDF(
      demande,
      materielsList,
      demande.beneficiaireSource,
      demande.beneficiaireDestination,
      demande.dateValidation || demande.dateDemande,
      demande.observations
    );
  };

  // Générer plusieurs PVs en un seul fichier
  const generateMultiplePV = () => {
    if (selectedDemandes.length === 0) {
      toast.warning('Veuillez sélectionner au moins une demande');
      return;
    }

    setDownloading(true);
    try {
      selectedDemandes.forEach((demande, index) => {
        const materielsList = getMaterielsList(demande);
        if (materielsList.length > 0) {
          generatePVChangementPDF(
            demande,
            materielsList,
            demande.beneficiaireSource,
            demande.beneficiaireDestination,
            demande.dateValidation || demande.dateDemande,
            demande.observations
          );
        }
      });
      toast.success(`${selectedDemandes.length} PV(s) généré(s) avec succès`);
    } catch (error) {
      console.error('Erreur génération PVs:', error);
      toast.error('Erreur lors de la génération des PVs');
    } finally {
      setDownloading(false);
    }
  };

  // Générer tous les PVs filtrés
  const generateAllFilteredPV = () => {
    if (filteredDemandes.length === 0) {
      toast.warning('Aucune demande à exporter');
      return;
    }

    setDownloading(true);
    try {
      filteredDemandes.forEach((demande) => {
        const materielsList = getMaterielsList(demande);
        if (materielsList.length > 0) {
          generatePVChangementPDF(
            demande,
            materielsList,
            demande.beneficiaireSource,
            demande.beneficiaireDestination,
            demande.dateValidation || demande.dateDemande,
            demande.observations
          );
        }
      });
      toast.success(`${filteredDemandes.length} PV(s) généré(s) avec succès`);
    } catch (error) {
      console.error('Erreur génération PVs:', error);
      toast.error('Erreur lors de la génération des PVs');
    } finally {
      setDownloading(false);
    }
  };

  // Sélectionner/désélectionner toutes les demandes
  const toggleSelectAll = () => {
    if (selectedDemandes.length === filteredDemandes.length) {
      setSelectedDemandes([]);
    } else {
      setSelectedDemandes([...filteredDemandes]);
    }
  };

  // Sélectionner/désélectionner une demande
  const toggleSelectDemande = (demande) => {
    if (selectedDemandes.find(d => d.id === demande.id)) {
      setSelectedDemandes(selectedDemandes.filter(d => d.id !== demande.id));
    } else {
      setSelectedDemandes([...selectedDemandes, demande]);
    }
  };

  const stats = {
    total: demandes.length,
    filtrees: filteredDemandes.length,
    selectionnees: selectedDemandes.length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Téléchargement des PVs de Changement</h1>
            <p className="text-purple-100 mt-1">
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <FiFileText className="text-3xl" />
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <FiCheckCircle className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total PVs disponibles</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FiSearch className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">PVs filtrés</p>
              <p className="text-2xl font-bold text-gray-800">{stats.filtrees}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <FiDownload className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sélectionnés</p>
              <p className="text-2xl font-bold text-gray-800">{stats.selectionnees}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <FiPrinter className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Actions disponibles</p>
              <p className="text-lg font-bold text-gray-800">Export groupé</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <button
          onClick={() => setExpandedFilters(!expandedFilters)}
          className="w-full px-6 py-4 flex justify-between items-center text-left"
        >
          <span className="font-semibold text-gray-700">Filtres avancés</span>
          {expandedFilters ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        
        {expandedFilters && (
          <div className="px-6 pb-6 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtre rapide
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="toutes">Toutes les demandes</option>
                  <option value="aujourdhui">Aujourd'hui</option>
                  <option value="semaine">Cette semaine</option>
                  <option value="mois">Ce mois</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barre d'actions */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par ID, bénéficiaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={toggleSelectAll}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {selectedDemandes.length === filteredDemandes.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
            
            <button
              onClick={generateMultiplePV}
              disabled={selectedDemandes.length === 0 || downloading}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {downloading ? <FiLoader className="animate-spin" /> : <FiDownload />}
              Télécharger sélection ({selectedDemandes.length})
            </button>
            
            <button
              onClick={generateAllFilteredPV}
              disabled={filteredDemandes.length === 0 || downloading}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {downloading ? <FiLoader className="animate-spin" /> : <FiPrinter />}
              Télécharger tous ({filteredDemandes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <input
                    type="checkbox"
                    checked={selectedDemandes.length === filteredDemandes.length && filteredDemandes.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Demande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expéditeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinataire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nb Matériels</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date validation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDemandes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <FiFileText className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p>Aucune demande validée trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredDemandes.map((demande) => {
                  const materielsCount = demande.materiels?.length || (demande.materiel ? 1 : 0);
                  return (
                    <tr key={demande.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedDemandes.some(d => d.id === demande.id)}
                          onChange={() => toggleSelectDemande(demande)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{demande.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FiUser className="mr-2 text-gray-400" size={14} />
                          {demande.beneficiaireSource?.nom} {demande.beneficiaireSource?.prenom}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FiUser className="mr-2 text-gray-400" size={14} />
                          {demande.beneficiaireDestination?.nom} {demande.beneficiaireDestination?.prenom}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FiPackage className="mr-2 text-gray-400" size={14} />
                          {materielsCount} matériel(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2 text-gray-400" size={14} />
                          {new Date(demande.dateValidation).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => generateSinglePV(demande)}
                          className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
                          title="Télécharger le PV"
                        >
                          <FiDownload size={16} />
                          Télécharger
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PVDemandesDownload;