import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiArrowLeft, FiUser } from 'react-icons/fi';
import { getPriseEnChargeByAchat, getMaterielsAttribuesParAchatEtBeneficiaire } from '../../services/materialService';
import { getAchatById } from '../../services/achatService';
import { toast } from 'react-toastify';
import './PriseEnCharge.css';

const PriseEnCharge = () => {
  const { achatId } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();
  
  const [achat, setAchat] = useState(null);
  const [priseEnCharge, setPriseEnCharge] = useState([]);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState(null);
  const [materielsBeneficiaire, setMaterielsBeneficiaire] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllBeneficiaires, setShowAllBeneficiaires] = useState(true);
  
  // ✅ NOUVEAU: Pour suivre quels formulaires imprimer
  const [formsToPrint, setFormsToPrint] = useState([]);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const achatRes = await getAchatById(achatId);
        setAchat(achatRes.data);
        
        const priseEnChargeRes = await getPriseEnChargeByAchat(achatId);
        console.log('Réponse prise en charge:', priseEnChargeRes.data);
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

  // ✅ NOUVELLE FONCTION: Imprimer uniquement les formulaires sélectionnés
  const handlePrint = () => {
    // Si un bénéficiaire est sélectionné, imprimer seulement le sien
    if (selectedBeneficiaire) {
      setFormsToPrint([selectedBeneficiaire.id]);
    } else if (!showAllBeneficiaires) {
      // Si mode sélection mais aucun bénéficiaire, revenir à tous
      setFormsToPrint(priseEnCharge.map(dto => dto.beneficiaire?.id));
    } else {
      // Si tous affichés, imprimer tous
      setFormsToPrint(priseEnCharge.map(dto => dto.beneficiaire?.id));
    }
    
    // Attendre que le state soit mis à jour avant d'imprimer
    setTimeout(() => {
      window.print();
      // Réinitialiser après impression
      setTimeout(() => {
        setFormsToPrint([]);
      }, 1000);
    }, 100);
  };

  const calculateTotalTTC = (materiels) => {
    return materiels.reduce((total, m) => {
      const prixUnitaire = m.prix?.prixUnitaireHT || m.prix?.prixUnitaire || 0;
      const qte = 1;
      return total + (prixUnitaire * qte);
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

  // ✅ Vérifier si un formulaire doit être affiché/imprimé
  const shouldShowForm = (beneficiaireId) => {
    // Si aucun filtre, afficher tous
    if (formsToPrint.length === 0) {
      return showAllBeneficiaires;
    }
    // Sinon, afficher seulement ceux dans formsToPrint
    return formsToPrint.includes(beneficiaireId);
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
      {/* Barre d'outils - TOUJOURS cachée à l'impression */}
      <div className="toolbar no-print">
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
                setFormsToPrint([]);
              }}
            />
            Afficher tous les bénéficiaires
          </label>
          
          <button className="btn btn-primary" onClick={handlePrint}>
            <FiPrinter className="mr-2" /> Imprimer
          </button>
          
          {/* ✅ NOUVEAU: Bouton pour sélectionner les bénéficiaires à imprimer */}
          {showAllBeneficiaires && (
            <button 
              className="btn btn-success" 
              onClick={() => {
                setShowAllBeneficiaires(false);
                setFormsToPrint([]);
              }}
            >
              <FiUser className="mr-2" /> Sélectionner
            </button>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="content" ref={componentRef}>
        {showAllBeneficiaires ? (
          // Afficher tous les bénéficiaires
          priseEnCharge.map((dto, index) => (
            <div 
              key={dto.beneficiaire?.id || index}
              className={formsToPrint.length > 0 && !formsToPrint.includes(dto.beneficiaire?.id) ? 'no-print' : ''}
            >
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
          ))
        ) : selectedBeneficiaire ? (
          // Afficher un seul bénéficiaire
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
          // Sélection du bénéficiaire
          <div className="select-beneficiaire">
            <h2>Sélectionner un bénéficiaire à imprimer</h2>
            <div className="beneficiaire-list">
              {priseEnCharge.map((dto) => (
                <button
                  key={dto.beneficiaire?.id}
                  className="beneficiaire-card"
                  onClick={() => {
                    setSelectedBeneficiaire(dto.beneficiaire);
                    setFormsToPrint([dto.beneficiaire?.id]);
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
            
            {/* ✅ Bouton pour revenir à tous */}
            <button 
              className="btn btn-secondary mt-4"
              onClick={() => {
                setSelectedBeneficiaire(null);
                setShowAllBeneficiaires(true);
                setFormsToPrint([]);
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

// Composant Formulaire de Prise en Charge
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
    <div className="prise-en-charge-form page-break">
      {/* En-tête */}
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

      {/* Origine */}
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

      {/* Détenteur */}
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

      {/* Tableau des matériels */}
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

      {/* Pied de page */}
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