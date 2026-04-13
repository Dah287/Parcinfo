// ReaffectationValidationController.java
package com.example.parcinfo.controller;

import com.example.parcinfo.dto.AttributionMaterialDTO;
import com.example.parcinfo.dto.DemandeReaffectationGroupeeDTO;
import com.example.parcinfo.model.DemandeReaffectation;
import com.example.parcinfo.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reaffectation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReaffectationValidationController {

    private final MaterialService materialService;

    @PostMapping("/demande")
    public ResponseEntity<DemandeReaffectation> creerDemande(
            @RequestBody DemandeReaffectationRequest request) {
        DemandeReaffectation demande = materialService.creerDemandeReaffectation(
                request.getDto(),
                request.getDemandeurId(),
                request.getValidateurId()
        );
        return ResponseEntity.ok(demande);
    }

    @PostMapping("/valider/{demandeId}")
    public ResponseEntity<DemandeReaffectation> validerDemande(
            @PathVariable Long demandeId,
            @RequestParam Long validateurId,
            @RequestParam boolean accepte,
            @RequestParam(required = false) String motifRejet) {
        DemandeReaffectation demande = materialService.validerDemande(
                demandeId, validateurId, accepte, motifRejet);
        return ResponseEntity.ok(demande);
    }

    @GetMapping("/demandes/en-attente/{validateurId}")
    public ResponseEntity<List<DemandeReaffectation>> getDemandesEnAttente(
            @PathVariable Long validateurId) {
        return ResponseEntity.ok(materialService.getDemandesEnAttentePourValidateur(validateurId));
    }

    // ✅ NOUVEL ENDPOINT : Récupérer toutes les demandes d'un utilisateur (demandeur OU validateur)
    @GetMapping("/demandes/user/{userId}")
    public ResponseEntity<List<DemandeReaffectation>> getDemandesByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(materialService.getDemandesByUser(userId));
    }
    // ReaffectationValidationController.java - Ajouter ces endpoints

    @PostMapping("/demande/groupee")
    public ResponseEntity<DemandeReaffectation> creerDemandeGroupee(
            @RequestBody DemandeReaffectationGroupeeDTO dto) {
        DemandeReaffectation demande = materialService.creerDemandeReaffectationGroupee(dto);
        return ResponseEntity.ok(demande);
    }

    @PostMapping("/valider/groupee/{demandeId}")
    public ResponseEntity<DemandeReaffectation> validerDemandeGroupee(
            @PathVariable Long demandeId,
            @RequestParam Long validateurId,
            @RequestParam boolean accepte,
            @RequestParam(required = false) String motifRejet) {
        DemandeReaffectation demande = materialService.validerDemandeGroupee(
                demandeId, validateurId, accepte, motifRejet);
        return ResponseEntity.ok(demande);
    }
}

class DemandeReaffectationRequest {

    private AttributionMaterialDTO dto;
    private Long demandeurId;
    private Long validateurId;

    // Getter & Setter dto
    public AttributionMaterialDTO getDto() {
        return dto;
    }

    public void setDto(AttributionMaterialDTO dto) {
        this.dto = dto;
    }

    // Getter & Setter demandeurId
    public Long getDemandeurId() {
        return demandeurId;
    }

    public void setDemandeurId(Long demandeurId) {
        this.demandeurId = demandeurId;
    }

    // Getter & Setter validateurId
    public Long getValidateurId() {
        return validateurId;
    }

    public void setValidateurId(Long validateurId) {
        this.validateurId = validateurId;
    }
}