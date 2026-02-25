package com.example.parcinfo.service;

import com.example.parcinfo.dto.HistoriqueAttributionDTO;
import com.example.parcinfo.model.HistoriqueAttribution;
import com.example.parcinfo.model.Beneficiaire;
import com.example.parcinfo.model.Material;
import com.example.parcinfo.model.TypeOperation;
import com.example.parcinfo.repository.BeneficiaireRepository;
import com.example.parcinfo.repository.HistoriqueAttributionRepository;
import com.example.parcinfo.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoriqueAttributionService {

    @Autowired
    HistoriqueAttributionRepository historiqueRepository;
    @Autowired
    MaterialRepository materialRepository;
    @Autowired
    BeneficiaireRepository beneficiaireRepository;

    /**
     * Enregistrer une opération d'attribution dans l'historique
     */
    @Transactional
    public void enregistrerAttribution(Long materielId, Long ancienBeneficiaireId,
                                       Long nouveauBeneficiaireId, TypeOperation typeOperation,
                                       String commentaire) {
        Material materiel = materialRepository.findById(materielId)
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé"));

        Beneficiaire ancienBenef = (ancienBeneficiaireId != null) ?
                beneficiaireRepository.findById(ancienBeneficiaireId).orElse(null) : null;

        Beneficiaire nouveauBenef = (nouveauBeneficiaireId != null) ?
                beneficiaireRepository.findById(nouveauBeneficiaireId).orElse(null) : null;

        HistoriqueAttribution historique = HistoriqueAttribution.builder()
                .materiel(materiel)
                .ancienBeneficiaire(ancienBenef)
                .nouveauBeneficiaire(nouveauBenef)
                .typeOperation(typeOperation)
                .dateAttribution(LocalDateTime.now())
                .commentaire(commentaire)
                .build();

        historiqueRepository.save(historique);
    }

    /**
     * Obtenir l'historique complet d'un matériel
     */
    public List<HistoriqueAttributionDTO> getHistoriqueByMaterielId(Long materielId) {
        List<HistoriqueAttribution> historiques = historiqueRepository
                .findByMaterielIdOrderByDateOperationDesc(materielId);

        return historiques.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtenir l'historique des attributions d'un bénéficiaire (matériels reçus)
     */
    public List<HistoriqueAttributionDTO> getHistoriqueByBeneficiaireId(Long beneficiaireId) {
        List<HistoriqueAttribution> historiques = historiqueRepository
                .findByNouveauBeneficiaireIdOrderByDateOperationDesc(beneficiaireId);

        return historiques.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtenir l'historique des libérations d'un bénéficiaire (matériels rendus)
     */
    public List<HistoriqueAttributionDTO> getHistoriqueLibereByBeneficiaireId(Long beneficiaireId) {
        List<HistoriqueAttribution> historiques = historiqueRepository
                .findByAncienBeneficiaireIdOrderByDateOperationDesc(beneficiaireId);

        return historiques.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtenir tous les historiques
     */
    public List<HistoriqueAttributionDTO> getAllHistorique() {
        List<HistoriqueAttribution> historiques = historiqueRepository.findAll();
        return historiques.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtenir le nombre total d'opérations pour un matériel
     */
    public long getCountOperationsByMateriel(Long materielId) {
        return historiqueRepository.countByMaterielId(materielId);
    }

    /**
     * Obtenir le nombre total d'attributions pour un bénéficiaire
     */
    public long getCountAttributionsByBeneficiaire(Long beneficiaireId) {
        return historiqueRepository.countByNouveauBeneficiaireId(beneficiaireId);
    }

    /**
     * Convertir HistoriqueAttribution en DTO
     */
    private HistoriqueAttributionDTO convertToDTO(HistoriqueAttribution h) {
        return HistoriqueAttributionDTO.builder()
                .id(h.getId())
                .materielId(h.getMateriel().getId())
                .numeroInventaire(h.getMateriel().getNumeroInventaire())
                .typeMateriel(h.getMateriel().getType().getDesignation())
                .ancienBeneficiaireId(getBeneficiaireId(h.getAncienBeneficiaire()))
                .ancienBeneficiaireNom(getBeneficiaireNom(h.getAncienBeneficiaire()))
                .ancienBeneficiairePrenom(getBeneficiairePrenom(h.getAncienBeneficiaire()))
                .ancienBeneficiaireDepartement(getBeneficiaireDepartement(h.getAncienBeneficiaire()))
                .nouveauBeneficiaireId(getBeneficiaireId(h.getNouveauBeneficiaire()))
                .nouveauBeneficiaireNom(getBeneficiaireNom(h.getNouveauBeneficiaire()))
                .nouveauBeneficiairePrenom(getBeneficiairePrenom(h.getNouveauBeneficiaire()))
                .nouveauBeneficiaireDepartement(getBeneficiaireDepartement(h.getNouveauBeneficiaire()))
                .typeOperation(h.getTypeOperation())
                .typeOperationLibelle(h.getTypeOperation().getLibelle())
                .dateOperation(h.getDateOperation())
                .dateAttribution(h.getDateAttribution())
                .commentaire(h.getCommentaire())
                .build();
    }

    private Long getBeneficiaireId(Beneficiaire b) {
        return (b != null) ? b.getId() : null;
    }

    private String getBeneficiaireNom(Beneficiaire b) {
        return (b != null) ? b.getNom() : null;
    }

    private String getBeneficiairePrenom(Beneficiaire b) {
        return (b != null) ? b.getPrenom() : null;
    }

    private String getBeneficiaireDepartement(Beneficiaire b) {
        return (b != null) ? b.getDepartmentNom() : null;
    }
}