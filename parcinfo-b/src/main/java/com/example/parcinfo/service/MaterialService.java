package com.example.parcinfo.service;

import com.example.parcinfo.dto.AttributionMaterialDTO;
import com.example.parcinfo.model.Material;
import com.example.parcinfo.model.Beneficiaire;
import com.example.parcinfo.model.TypeOperation;
import com.example.parcinfo.repository.MaterialRepository;
import com.example.parcinfo.repository.BeneficiaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    @Autowired
    MaterialRepository materialRepository;
    @Autowired
    BeneficiaireRepository beneficiaireRepository;
    @Autowired
    HistoriqueAttributionService historiqueService;
    @Transactional(readOnly = true)
    public List<Material> getAllMateriels() {
        return materialRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Material getMaterielById(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé"));
    }

    /**
     * Attribuer un matériel à un bénéficiaire
     */
    @Transactional
    public Material attribuerMateriel(AttributionMaterialDTO dto) {
        Material materiel = materialRepository.findById(dto.getMaterielId())
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé avec l'ID: " + dto.getMaterielId()));

        Beneficiaire beneficiaire = beneficiaireRepository.findById(dto.getBeneficiaireId())
                .orElseThrow(() -> new RuntimeException("Bénéficiaire non trouvé avec l'ID: " + dto.getBeneficiaireId()));

        if (materiel.getEtat() != Material.EtatMateriel.DISPONIBLE) {
            throw new RuntimeException("Le matériel n'est pas disponible pour attribution. État actuel: " + materiel.getEtat());
        }

        // Enregistrer dans l'historique AVANT la modification
        historiqueService.enregistrerAttribution(
                materiel.getId(),
                null, // pas d'ancien bénéficiaire
                beneficiaire.getId(),
                TypeOperation.ATTRIBUTION_INITIALE,
                "Attribution initiale du matériel " + materiel.getNumeroInventaire() + " à " +
                        beneficiaire.getNom() + " " + beneficiaire.getPrenom()
        );

        // Attribuer le matériel
        materiel.setBeneficiaire(beneficiaire);
        materiel.setEtat(Material.EtatMateriel.ATTRIBUE);
        materiel.setDateAttribution(dto.getDateAttribution() != null ?
                dto.getDateAttribution() : LocalDate.now());

        return materialRepository.save(materiel);
    }

    /**
     * Réaffecter un matériel à un autre bénéficiaire
     */
    @Transactional
    public Material reaffecterMateriel(AttributionMaterialDTO dto) {
        Material materiel = materialRepository.findById(dto.getMaterielId())
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé avec l'ID: " + dto.getMaterielId()));

        Beneficiaire nouveauBeneficiaire = beneficiaireRepository.findById(dto.getBeneficiaireId())
                .orElseThrow(() -> new RuntimeException("Bénéficiaire non trouvé avec l'ID: " + dto.getBeneficiaireId()));

        if (materiel.getEtat() != Material.EtatMateriel.ATTRIBUE) {
            throw new RuntimeException("Le matériel doit être attribué pour pouvoir être réaffecté. État actuel: " + materiel.getEtat());
        }

        Long ancienBeneficiaireId = (materiel.getBeneficiaire() != null) ?
                materiel.getBeneficiaire().getId() : null;

        // Enregistrer dans l'historique AVANT la modification
        historiqueService.enregistrerAttribution(
                materiel.getId(),
                ancienBeneficiaireId,
                nouveauBeneficiaire.getId(),
                TypeOperation.REAFFECTATION,
                "Réaffectation du matériel " + materiel.getNumeroInventaire() +
                        " de " + (materiel.getBeneficiaire() != null ? materiel.getBeneficiaire().getNom() : "inconnu") +
                        " vers " + nouveauBeneficiaire.getNom() + " " + nouveauBeneficiaire.getPrenom()
        );

        // Réaffecter le matériel
        materiel.setBeneficiaire(nouveauBeneficiaire);
        materiel.setDateAttribution(dto.getDateAttribution() != null ?
                dto.getDateAttribution() : LocalDate.now());

        return materialRepository.save(materiel);
    }

    /**
     * Libérer un matériel (retirer l'attribution)
     */
    @Transactional
    public Material libererMateriel(Long materielId) {
        Material materiel = materialRepository.findById(materielId)
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé avec l'ID: " + materielId));

        if (materiel.getEtat() != Material.EtatMateriel.ATTRIBUE) {
            throw new RuntimeException("Le matériel n'est pas attribué. État actuel: " + materiel.getEtat());
        }

        Long ancienBeneficiaireId = (materiel.getBeneficiaire() != null) ?
                materiel.getBeneficiaire().getId() : null;

        // Enregistrer dans l'historique AVANT la modification
        historiqueService.enregistrerAttribution(
                materiel.getId(),
                ancienBeneficiaireId,
                null, // pas de nouveau bénéficiaire
                TypeOperation.LIBERATION,
                "Libération du matériel " + materiel.getNumeroInventaire() +
                        " par " + (materiel.getBeneficiaire() != null ? materiel.getBeneficiaire().getNom() : "inconnu")
        );

        // Libérer le matériel
        materiel.setBeneficiaire(null);
        materiel.setEtat(Material.EtatMateriel.DISPONIBLE);
        materiel.setDateAttribution(null);

        return materialRepository.save(materiel);
    }

    @Transactional(readOnly = true)
    public List<Material> getMaterielsAttribues() {
        return materialRepository.findByEtat(Material.EtatMateriel.ATTRIBUE);
    }

    @Transactional(readOnly = true)
    public List<Material> getMaterielsDisponibles() {
        return materialRepository.findByEtat(Material.EtatMateriel.DISPONIBLE);
    }

    @Transactional(readOnly = true)
    public List<Material> getMaterielsByBeneficiaire(Long beneficiaireId) {
        return materialRepository.findByBeneficiaireId(beneficiaireId);
    }
}