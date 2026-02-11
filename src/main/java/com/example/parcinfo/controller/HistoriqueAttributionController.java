package com.example.parcinfo.controller;


import com.example.parcinfo.dto.HistoriqueAttributionDTO;
import com.example.parcinfo.service.HistoriqueAttributionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historique")
@RequiredArgsConstructor
public class HistoriqueAttributionController {

    @Autowired
    HistoriqueAttributionService historiqueService;

    /**
     * Obtenir l'historique complet d'un matériel
     */
    @GetMapping("/materiel/{materielId}")
    public ResponseEntity<List<HistoriqueAttributionDTO>> getHistoriqueByMateriel(
            @PathVariable Long materielId) {
        List<HistoriqueAttributionDTO> historique = historiqueService.getHistoriqueByMaterielId(materielId);
        return ResponseEntity.ok(historique);
    }

    /**
     * Obtenir l'historique des attributions d'un bénéficiaire
     */
    @GetMapping("/beneficiaire/{beneficiaireId}")
    public ResponseEntity<List<HistoriqueAttributionDTO>> getHistoriqueByBeneficiaire(
            @PathVariable Long beneficiaireId) {
        List<HistoriqueAttributionDTO> historique = historiqueService.getHistoriqueByBeneficiaireId(beneficiaireId);
        return ResponseEntity.ok(historique);
    }

    /**
     * Obtenir l'historique des libérations d'un bénéficiaire
     */
    @GetMapping("/beneficiaire/{beneficiaireId}/liberations")
    public ResponseEntity<List<HistoriqueAttributionDTO>> getHistoriqueLibereByBeneficiaire(
            @PathVariable Long beneficiaireId) {
        List<HistoriqueAttributionDTO> historique = historiqueService.getHistoriqueLibereByBeneficiaireId(beneficiaireId);
        return ResponseEntity.ok(historique);
    }

    /**
     * Obtenir tous les historiques
     */
    @GetMapping
    public ResponseEntity<List<HistoriqueAttributionDTO>> getAllHistorique() {
        List<HistoriqueAttributionDTO> historique = historiqueService.getAllHistorique();
        return ResponseEntity.ok(historique);
    }

    /**
     * Obtenir le nombre d'opérations pour un matériel
     */
    @GetMapping("/materiel/{materielId}/count")
    public ResponseEntity<Long> getCountOperationsByMateriel(@PathVariable Long materielId) {
        long count = historiqueService.getCountOperationsByMateriel(materielId);
        return ResponseEntity.ok(count);
    }

    /**
     * Obtenir le nombre d'attributions pour un bénéficiaire
     */
    @GetMapping("/beneficiaire/{beneficiaireId}/count")
    public ResponseEntity<Long> getCountAttributionsByBeneficiaire(@PathVariable Long beneficiaireId) {
        long count = historiqueService.getCountAttributionsByBeneficiaire(beneficiaireId);
        return ResponseEntity.ok(count);
    }
}