import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiRefreshCw, 
  FiEdit, 
  FiTrash,
  FiInfo 
} from 'react-icons/fi';
import { 
  getAllMateriels, 
  getMaterielsDisponibles,
  getMaterielsAttribues,
  searchMateriels 
} from '../../services/materialService';

const MaterielsTable = () => {
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        
        if (activeTab === 'disponibles') {
          response = await getMaterielsDisponibles();
        } else if (activeTab === 'attribues') {
          response = await getMaterielsAttribues();
        } else {
          response = await getAllMateriels();
        }
        
        setMateriels(response.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des matériels');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (searchTerm.trim() === '') {
        const response = activeTab === 'disponibles' 
          ? await getMaterielsDisponibles()
          : activeTab === 'attribues'
            ? await getMaterielsAttribues()
            : await getAllMateriels();
        setMateriels(response.data);
      } else {
        const response = await searchMateriels(searchTerm);
        setMateriels(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (etat) => {
    const statusMap = {
      DISPONIBLE: 'bg-green-100 text-green-800',
      ATTRIBUE: 'bg-blue-100 text-blue-800',
      EN_PANNE: 'bg-red-100 text-red-800',
      HORS_SERVICE: 'bg-gray-100 text-gray-800',
      VENDU: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMap[etat] || 'bg-gray-100 text-gray-800'}`}>
        {etat}
      </span>
    );
  };

  const getCaracteristiquesDisplay = (caracteristiques) => {
    if (!caracteristiques || Object.keys(caracteristiques).length === 0) {
      return 'Aucune';
    }
    
    // Afficher les caractéristiques principales
    const principales = ['RAM', 'Processeur', 'Stockage', 'Ecran', 'OS'];
    const display = principales
      .filter(cle => caracteristiques[cle])
      .map(cle => `${cle}: ${caracteristiques[cle]}`)
      .join(' | ');
    
    return display || 'Voir détails';
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Matériels</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({materiels.length})
          </button>
          <button 
            onClick={() => setActiveTab('disponibles')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'disponibles' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Disponibles
          </button>
          <button 
            onClick={() => setActiveTab('attribues')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'attribues' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Attribués
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par numéro d'inventaire, série, type, bénéficiaire..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FiSearch className="mr-2" /> Rechercher
            </button>
            <button
              type="button"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              onClick={() => setSearchTerm('')}
            >
              <FiRefreshCw className="mr-2" /> Réinitialiser
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marque</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Inventaire</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Série</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Système</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bénéficiaire</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Création</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materiels.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FiInfo size={48} className="text-gray-300 mb-2" />
                      <p className="text-lg font-medium">Aucun matériel trouvé</p>
                      <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos critères de recherche</p>
                    </div>
                  </td>
                </tr>
              ) : (
                materiels.map(materiel => (
                  <React.Fragment key={materiel.id}>
                    <tr 
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        expandedRow === materiel.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => toggleRow(materiel.id)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-600">#{materiel.id}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <div className="text-sm font-medium text-gray-900">{materiel.type?.libelle || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{materiel.marque?.libelle || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{materiel.numeroInventaire || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{materiel.numeroSerie || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{materiel.systemeExploitation?.libelle || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {materiel.beneficiaire 
                            ? `${materiel.beneficiaire.nom} ${materiel.beneficiaire.prenom || ''}`
                            : 'Non attribué'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(materiel.etat)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {materiel.dateCreation ? new Date(materiel.dateCreation).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1"
                            onClick={(e) => { e.stopPropagation(); /* TODO: Edit */ }}
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 p-1"
                            onClick={(e) => { e.stopPropagation(); /* TODO: Delete */ }}
                          >
                            <FiTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Ligne détaillée */}
                    {expandedRow === materiel.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="10" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">Caractéristiques:</span>
                              <div className="mt-1 text-gray-600 space-y-1">
                                {materiel.caracteristiques && Object.keys(materiel.caracteristiques).length > 0 ? (
                                  Object.entries(materiel.caracteristiques).map(([cle, valeur]) => (
                                    <div key={cle} className="flex">
                                      <span className="font-medium mr-2">{cle}:</span>
                                      <span>{valeur}</span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-gray-400">Aucune caractéristique</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-semibold text-gray-700">Fournisseur:</span>
                              <div className="mt-1 text-gray-600">
                                {materiel.fournisseur?.nom || 'Non spécifié'}
                              </div>
                              
                              <span className="font-semibold text-gray-700 mt-2 block">Prix:</span>
                              <div className="mt-1 text-gray-600">
                                {materiel.prix?.designation || 'N/A'}
                              </div>
                              
                              <span className="font-semibold text-gray-700 mt-2 block">Date d'attribution:</span>
                              <div className="mt-1 text-gray-600">
                                {materiel.dateAttribution 
                                  ? new Date(materiel.dateAttribution).toLocaleDateString('fr-FR')
                                  : 'Non attribué'}
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-semibold text-gray-700">Observations:</span>
                              <div className="mt-1 text-gray-600 bg-white p-2 rounded border border-gray-200">
                                {materiel.observations || 'Aucune observation'}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {materiels.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center flex-col sm:flex-row">
            <div className="text-sm text-gray-500 mb-2 sm:mb-0">
              Affichage de <span className="font-semibold">{materiels.length}</span> matériel(s)
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                Précédent
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterielsTable;