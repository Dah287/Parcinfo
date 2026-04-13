// components/materiels/DemandesReaffectation.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiClock, 
  FiCheck, 
  FiX, 
  FiUser, 
  FiPackage, 
  FiSearch,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiUserCheck,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import { getAllDemandes, validerDemande } from '../../services/reaffectationValidationService';
import { getCurrentUser } from '../../services/authService';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DemandesReaffectation = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [motifRejet, setMotifRejet] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [demandeEnCours, setDemandeEnCours] = useState(null);
  const [filter, setFilter] = useState('a_valider');

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
        setDemandes(Array.isArray(demandesData) ? demandesData : []);
        
        // Mettre à jour le badge dans le sidebar
        const demandesAAvalider = demandesData.filter(d => 
          d.validateur?.id === user.id && d.statut === 'EN_ATTENTE'
        ).length;
        window.dispatchEvent(new CustomEvent('demandesUpdated', { detail: { count: demandesAAvalider } }));
      }
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      toast.error('Erreur lors du chargement des demandes');
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDemandes();
    setRefreshing(false);
    toast.info('Liste des demandes actualisée');
  };

  const handleValidation = async (demande, accepte) => {
    if (!accepte && !motifRejet.trim()) {
      toast.warning('Veuillez fournir un motif de refus');
      return;
    }

    try {
      const result = await validerDemande(
        demande.id,
        currentUser.id,
        accepte,
        accepte ? null : motifRejet
      );

      if (accepte) {
        toast.success(`Demande #${demande.id} validée avec succès`);
      } else {
        toast.warning(`Demande #${demande.id} refusée`);
      }

      window.dispatchEvent(new CustomEvent('demandesUpdated', { 
        detail: { 
          demandeId: demande.id, 
          statut: result.statut,
          accepte: accepte 
        } 
      }));

      await loadDemandes();
      
      setShowRejectModal(false);
      setMotifRejet('');
      setDemandeEnCours(null);
      setSelectedDemande(null);
      setShowDetailsModal(false);
      
    } catch (error) {
      console.error('Erreur validation:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const getFilteredDemandes = () => {
    let filtered = demandes;
    
    if (currentUser?.role === 'ADMIN') {
      if (filter === 'a_valider') {
        filtered = demandes.filter(d => d.statut === 'EN_ATTENTE' && d.validateur?.id === currentUser.id);
      } else if (filter === 'mes_demandes') {
        filtered = demandes.filter(d => d.demandeur?.id === currentUser.id);
      } else if (filter === 'validees') {
        filtered = demandes.filter(d => d.statut === 'VALIDEE');
      } else if (filter === 'refusees') {
        filtered = demandes.filter(d => d.statut === 'REJETEE');
      } else {
        filtered = demandes;
      }
    } else {
      if (filter === 'a_valider') {
        filtered = demandes.filter(d => d.statut === 'EN_ATTENTE' && d.validateur?.id === currentUser?.id);
      } else if (filter === 'validees') {
        filtered = demandes.filter(d => d.statut === 'VALIDEE');
      } else if (filter === 'refusees') {
        filtered = demandes.filter(d => d.statut === 'REJETEE');
      } else {
        filtered = demandes;
      }
    }
    
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.id?.toString().includes(searchTerm) ||
        d.materiel?.numeroInventaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.materiel?.type?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.beneficiaireSource?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.beneficiaireDestination?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredDemandes = getFilteredDemandes();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDemandes = filteredDemandes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage);

  const stats = {
    aValider: demandes.filter(d => d.statut === 'EN_ATTENTE' && d.validateur?.id === currentUser?.id).length,
    mesDemandes: demandes.filter(d => d.demandeur?.id === currentUser?.id).length,
    validees: demandes.filter(d => d.statut === 'VALIDEE').length,
    refusees: demandes.filter(d => d.statut === 'REJETEE').length,
    total: demandes.length
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      'EN_ATTENTE': { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, text: 'En attente' },
      'VALIDEE_PAR_USER': { color: 'bg-blue-100 text-blue-800', icon: FiUserCheck, text: 'Validée (USER)' },
      'VALIDEE': { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, text: 'Validée' },
      'REJETEE': { color: 'bg-red-100 text-red-800', icon: FiXCircle, text: 'Refusée' }
    };
    const config = statusConfig[statut] || statusConfig['EN_ATTENTE'];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="mr-1" size={12} />
        {config.text}
      </span>
    );
  };

// Dans DemandesReaffectation.jsx - Modifier generatePVPDF

const generatePVPDF = (demande) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("ORMVAD", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.text("SMG/BPI", 14, 21);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const titleText = "PROCES VERBAL DE TRANSFERT";
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, 35);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`N° Demande: ${demande.id}`, 14, 50);
    doc.text(`Date: ${new Date(demande.dateDemande).toLocaleDateString('fr-FR')}`, 14, 57);
    
    doc.text("L'Expéditeur:", 14, 70);
    doc.text(`${demande.beneficiaireSource?.nom || ''} ${demande.beneficiaireSource?.prenom || ''}`, 50, 70);
    doc.text(`Matricule: ${demande.beneficiaireSource?.matricule || ''}`, 50, 77);
    
    doc.text("Le Preneur:", 14, 90);
    doc.text(`${demande.beneficiaireDestination?.nom || ''} ${demande.beneficiaireDestination?.prenom || ''}`, 50, 90);
    doc.text(`Matricule: ${demande.beneficiaireDestination?.matricule || ''}`, 50, 97);
    
    // ✅ Tableau avec TOUS les matériels
    const tableBody = demande.materiels?.map(materiel => [
        materiel.numeroInventaire || '',
        materiel.type?.designation || '',
        materiel.numeroSerie || '',
        "Transféré"
    ]) || [];
    
    autoTable(doc, {
        startY: 110,
        head: [["Code Inventaire", "Désignation", "N° Série", "État"]],
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] }
    });
    
    const finalY = doc.lastAutoTable?.finalY || 150;
    
    // Ajouter le récapitulatif
    doc.setFontSize(10);
    doc.text(`Total des matériels transférés: ${demande.materiels?.length || 0}`, 14, finalY + 15);
    
    doc.text("Fait à: ....................", 14, finalY + 30);
    doc.text("L'EXPEDITEUR", 14, finalY + 50);
    doc.text("LE PRENEUR", pageWidth - 50, finalY + 50);
    
    doc.save(`PV_Transfert_${demande.id}.pdf`);
    toast.success('PV téléchargé avec succès');
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
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Demandes de Réaffectation</h1>
            <p className="text-gray-600 mt-1">
              {currentUser?.role === 'ADMIN' 
                ? 'Administrateur - Visualisez et gérez toutes les demandes' 
                : 'Validez ou refusez les demandes de transfert de matériels'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
              title="Actualiser"
            >
              <FiRefreshCw className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} size={20} />
            </button>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiPackage className="text-purple-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques pour ADMIN */}
      {currentUser?.role === 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div 
            className={`bg-blue-50 rounded-xl p-4 border cursor-pointer transition-all ${filter === 'toutes' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-200'}`}
            onClick={() => { setFilter('toutes'); setCurrentPage(1); }}
          >
            <div className="flex items-center">
              <FiPackage className="text-blue-600 text-2xl mr-3" />
              <div>
                <p className="text-sm text-blue-600">Toutes</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div 
            className={`bg-yellow-50 rounded-xl p-4 border cursor-pointer transition-all ${filter === 'a_valider' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-yellow-200'}`}
            onClick={() => { setFilter('a_valider'); setCurrentPage(1); }}
          >
            <div className="flex items-center">
              <FiClock className="text-yellow-600 text-2xl mr-3" />
              <div>
                <p className="text-sm text-yellow-600">À valider</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.aValider}</p>
              </div>
            </div>
          </div>
          <div 
            className={`bg-indigo-50 rounded-xl p-4 border cursor-pointer transition-all ${filter === 'mes_demandes' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-indigo-200'}`}
            onClick={() => { setFilter('mes_demandes'); setCurrentPage(1); }}
          >
            <div className="flex items-center">
              <FiUser className="text-indigo-600 text-2xl mr-3" />
              <div>
                <p className="text-sm text-indigo-600">Mes demandes</p>
                <p className="text-2xl font-bold text-indigo-800">{stats.mesDemandes}</p>
              </div>
            </div>
          </div>
          <div 
            className={`bg-green-50 rounded-xl p-4 border cursor-pointer transition-all ${filter === 'validees' ? 'border-green-500 ring-2 ring-green-200' : 'border-green-200'}`}
            onClick={() => { setFilter('validees'); setCurrentPage(1); }}
          >
            <div className="flex items-center">
              <FiCheckCircle className="text-green-600 text-2xl mr-3" />
              <div>
                <p className="text-sm text-green-600">Validées</p>
                <p className="text-2xl font-bold text-green-800">{stats.validees}</p>
              </div>
            </div>
          </div>
          <div 
            className={`bg-red-50 rounded-xl p-4 border cursor-pointer transition-all ${filter === 'refusees' ? 'border-red-500 ring-2 ring-red-200' : 'border-red-200'}`}
            onClick={() => { setFilter('refusees'); setCurrentPage(1); }}
          >
            <div className="flex items-center">
              <FiXCircle className="text-red-600 text-2xl mr-3" />
              <div>
                <p className="text-sm text-red-600">Refusées</p>
                <p className="text-2xl font-bold text-red-800">{stats.refusees}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques pour USER */}
      {currentUser?.role !== 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            className={`bg-yellow-50 rounded-xl p-4 border cursor-pointer ${filter === 'a_valider' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-yellow-200'}`}
            onClick={() => { setFilter('a_valider'); setCurrentPage(1); }}
          >
            <div className="flex items-center">
              <FiClock className="text-yellow-600 text-2xl mr-3" />
              <div>
                <p className="text-sm text-yellow-600">À valider</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.aValider}</p>
              </div>
            </div>
          </div>
          <div 
            className={`bg-green-50 rounded-xl p-4 border cursor-pointer ${filter === 'validees' ? 'border-green-500 ring-2 ring-green-200' : 'border-green-200'}`}
            onClick={() => { setFilter('validees'); setCurrentPage(1); }}
          >
            <div className="flex items-center">
              <FiCheckCircle className="text-green-600 text-2xl mr-3" />
              <div>
                <p className="text-sm text-green-600">Validées</p>
                <p className="text-2xl font-bold text-green-800">{stats.validees}</p>
              </div>
            </div>
          </div>
          <div 
            className={`bg-red-50 rounded-xl p-4 border cursor-pointer ${filter === 'refusees' ? 'border-red-500 ring-2 ring-red-200' : 'border-red-200'}`}
            onClick={() => { setFilter('refusees'); setCurrentPage(1); }}
          >
            <div className="flex items-center">
              <FiXCircle className="text-red-600 text-2xl mr-3" />
              <div>
                <p className="text-sm text-red-600">Refusées</p>
                <p className="text-2xl font-bold text-red-800">{stats.refusees}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex justify-end">
          <div className="relative w-96">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID, matériel, bénéficiaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matériel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">De → Vers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demandeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDemandes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <FiPackage className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p>Aucune demande trouvée</p>
                  </td>
                </tr>
              ) : (
                currentDemandes.map((demande) => (
                  <tr key={demande.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{demande.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FiPackage className="mr-2 text-gray-400" size={16} />
                        <span className="font-medium">{demande.materiel?.numeroInventaire || 'N/A'}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{demande.materiel?.type?.designation}</div>
                      <div className="text-xs text-gray-400">NS: {demande.materiel?.numeroSerie || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-medium">{demande.beneficiaireSource?.nom} {demande.beneficiaireSource?.prenom}</div>
                      <div className="text-xs text-gray-400 my-1">↓</div>
                      <div className="font-medium">{demande.beneficiaireDestination?.nom} {demande.beneficiaireDestination?.prenom}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FiUser className="mr-1 text-gray-400" size={14} />
                        {demande.demandeur?.nom} {demande.demandeur?.prenom}
                      </div>
                      <div className="text-xs text-gray-400">{demande.demandeur?.role}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FiUserCheck className="mr-1 text-gray-400" size={14} />
                        {demande.validateur?.nom} {demande.validateur?.prenom}
                      </div>
                      <div className="text-xs text-gray-400">{demande.validateur?.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(demande.statut)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(demande.dateDemande).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDemande(demande);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Voir détails"
                      >
                        <FiEye size={18} />
                      </button>
                      
                      {(demande.statut === 'EN_ATTENTE' && demande.validateur?.id === currentUser?.id) && (
                        <>
                          <button
                            onClick={() => handleValidation(demande, true)}
                            className="text-green-600 hover:text-green-800 ml-2"
                            title="Valider"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setDemandeEnCours(demande);
                              setShowRejectModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 ml-2"
                            title="Refuser"
                          >
                            <FiX size={18} />
                          </button>
                        </>
                      )}
                      
                      {demande.statut === 'VALIDEE' && (
                        <button
                          onClick={() => generatePVPDF(demande)}
                          className="text-purple-600 hover:text-purple-800 ml-2"
                          title="Télécharger PV"
                        >
                          <FiDownload size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
           </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <FiChevronLeft />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Modal Détails */}


{/* Modal Détails */}
{showDetailsModal && selectedDemande && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">
            Détails de la demande #{selectedDemande.id}
          </h3>
          <button
            onClick={() => setShowDetailsModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* SECTION MATÉRIELS - Modifiée pour supporter la liste */}
          <div className="bg-gray-50 p-4 rounded-lg col-span-2">
            <label className="text-xs text-gray-500 uppercase font-semibold">
              Matériel(s) à transférer
            </label>
            {selectedDemande.materiels && selectedDemande.materiels.length > 0 ? (
              <div className="mt-2 space-y-2">
                {selectedDemande.materiels.map((materiel, index) => (
                  <div key={index} className="border-b border-gray-200 pb-2 last:border-0">
                    <p className="font-medium text-gray-800">
                      {materiel.numeroInventaire || 'Sans inventaire'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {materiel.type?.designation || 'Type non spécifié'}
                    </p>
                    <p className="text-xs text-gray-400">
                      NS: {materiel.numeroSerie || 'N/A'}
                    </p>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="text-sm font-semibold text-gray-700">
                    Total: {selectedDemande.materiels.length} matériel(s)
                  </p>
                </div>
              </div>
            ) : selectedDemande.materiel ? (
              // Compatibilité avec l'ancien format (un seul matériel)
              <div className="mt-2">
                <p className="font-medium text-gray-800">
                  {selectedDemande.materiel.numeroInventaire || 'Sans inventaire'}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedDemande.materiel.type?.designation || 'Type non spécifié'}
                </p>
                <p className="text-xs text-gray-400">
                  NS: {selectedDemande.materiel.numeroSerie || 'N/A'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic mt-2">Aucun matériel spécifié</p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs text-gray-500 uppercase font-semibold">Statut</label>
            <div className="mt-1">{getStatusBadge(selectedDemande.statut)}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs text-gray-500 uppercase font-semibold">Bénéficiaire Source</label>
            <p className="font-medium mt-1">{selectedDemande.beneficiaireSource?.nom} {selectedDemande.beneficiaireSource?.prenom}</p>
            <p className="text-sm text-gray-600">Matricule: {selectedDemande.beneficiaireSource?.matricule}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs text-gray-500 uppercase font-semibold">Bénéficiaire Destination</label>
            <p className="font-medium mt-1">{selectedDemande.beneficiaireDestination?.nom} {selectedDemande.beneficiaireDestination?.prenom}</p>
            <p className="text-sm text-gray-600">Matricule: {selectedDemande.beneficiaireDestination?.matricule}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs text-gray-500 uppercase font-semibold">Demandeur</label>
            <p className="font-medium mt-1">{selectedDemande.demandeur?.nom} {selectedDemande.demandeur?.prenom}</p>
            <p className="text-sm text-gray-600">Rôle: {selectedDemande.demandeur?.role}</p>
            <p className="text-xs text-gray-400">Matricule: {selectedDemande.demandeur?.matricule}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs text-gray-500 uppercase font-semibold">Validateur</label>
            <p className="font-medium mt-1">{selectedDemande.validateur?.nom} {selectedDemande.validateur?.prenom}</p>
            <p className="text-sm text-gray-600">Rôle: {selectedDemande.validateur?.role}</p>
            <p className="text-xs text-gray-400">Matricule: {selectedDemande.validateur?.matricule}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs text-gray-500 uppercase font-semibold">Date de demande</label>
            <p className="font-medium mt-1">{new Date(selectedDemande.dateDemande).toLocaleString('fr-FR')}</p>
          </div>
          
          {selectedDemande.dateValidation && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-xs text-gray-500 uppercase font-semibold">Date de validation</label>
              <p className="font-medium mt-1">{new Date(selectedDemande.dateValidation).toLocaleString('fr-FR')}</p>
            </div>
          )}
        </div>
        
        {selectedDemande.observations && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs text-gray-500 uppercase font-semibold">Observations</label>
            <p className="text-sm mt-1">{selectedDemande.observations}</p>
          </div>
        )}
        
        {selectedDemande.motifRejet && (
          <div className="bg-red-50 p-4 rounded-lg">
            <label className="text-xs text-red-500 uppercase font-semibold">Motif du refus</label>
            <p className="text-sm text-red-700 mt-1">{selectedDemande.motifRejet}</p>
          </div>
        )}
      </div>
      
      <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
        {(selectedDemande.statut === 'EN_ATTENTE' && selectedDemande.validateur?.id === currentUser?.id) && (
          <>
            <button
              onClick={() => {
                handleValidation(selectedDemande, true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiCheck className="inline mr-2" />
              Valider
            </button>
            <button
              onClick={() => {
                setDemandeEnCours(selectedDemande);
                setShowRejectModal(true);
                setShowDetailsModal(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <FiX className="inline mr-2" />
              Refuser
            </button>
          </>
        )}
        <button
          onClick={() => setShowDetailsModal(false)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
)}

      {/* Modal Refus */}
      {showRejectModal && demandeEnCours && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Motif du refus</h3>
              <p className="text-gray-600 mt-1">Demande #{demandeEnCours.id}</p>
            </div>
            
            <div className="p-6">
              <textarea
                value={motifRejet}
                onChange={(e) => setMotifRejet(e.target.value)}
                placeholder="Veuillez expliquer le motif du refus..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setMotifRejet('');
                  setDemandeEnCours(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleValidation(demandeEnCours, false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandesReaffectation;