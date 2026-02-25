package com.example.parcinfo.controller;

import com.example.parcinfo.dto.*;
import com.example.parcinfo.model.Beneficiaire;
import com.example.parcinfo.model.Material;
import com.example.parcinfo.repository.MaterialRepository;
import com.example.parcinfo.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/materiels")
@RequiredArgsConstructor
public class MaterialController {

    @Autowired
    MaterialRepository materialRepository;
    @Autowired
    MaterialService materialService;
    @GetMapping
    public ResponseEntity<List<Material>> getAllMateriels() {
        return ResponseEntity.ok(materialRepository.findAll());
    }

    //
    @PostMapping("/attribuer")
    public ResponseEntity<Material> attribuerMateriel(@RequestBody AttributionMaterialDTO dto) {
        Material materiel = materialService.attribuerMateriel(dto);
        return ResponseEntity.ok(materiel);
    }

    /**
     * Réaffecter un matériel à un autre bénéficiaire
     */
    @PostMapping("/reaffecter")
    public ResponseEntity<Material> reaffecterMateriel(@RequestBody AttributionMaterialDTO dto) {
        Material materiel = materialService.reaffecterMateriel(dto);
        return ResponseEntity.ok(materiel);
    }

    /**
     * Obtenir tous les matériels attribués
     */
    @GetMapping("/attribues")
    public ResponseEntity<List<Material>> getMaterielsAttribues() {
        List<Material> materiels = materialService.getMaterielsAttribues();
        return ResponseEntity.ok(materiels);
    }

    /**
     * Obtenir tous les matériels disponibles
     */
    @GetMapping("/disponibles")
    public ResponseEntity<List<Material>> getMaterielsDisponibles() {
        List<Material> materiels = materialService.getMaterielsDisponibles();
        return ResponseEntity.ok(materiels);
    }

    /**
     * Obtenir les matériels d'un bénéficiaire spécifique
     */
    @GetMapping("/beneficiaire/{beneficiaireId}")
    public ResponseEntity<List<Material>> getMaterielsByBeneficiaire(@PathVariable Long beneficiaireId) {
        List<Material> materiels = materialService.getMaterielsByBeneficiaire(beneficiaireId);
        return ResponseEntity.ok(materiels);
    }
    //



    @GetMapping("/{id}")
    public ResponseEntity<Material> getMaterielById(@PathVariable Long id) {
        return materialRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Material>> searchMateriels(@RequestParam String keyword) {
        return ResponseEntity.ok(materialRepository.searchByKeyword(keyword));
    }

    @GetMapping("/type/{typeId}")
    public ResponseEntity<List<Material>> getMaterielsByType(@PathVariable Long typeId) {
        return ResponseEntity.ok(materialRepository.findByTypeId(typeId));
    }

    @GetMapping("/etat/{etat}")
    public ResponseEntity<List<Material>> getMaterielsByEtat(@PathVariable String etat) {
        Material.EtatMateriel etatEnum;
        try {
            etatEnum = Material.EtatMateriel.valueOf(etat.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(materialRepository.findByEtat(etatEnum));
    }



    @PostMapping
    public ResponseEntity<Material> createMateriel(@RequestBody MaterialDTO dto) {
        Material materiel = dto.toEntity();
        return ResponseEntity.ok(materialRepository.save(materiel));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Material> updateMateriel(
            @PathVariable Long id,
            @RequestBody MaterialDTO dto) {
        return materialRepository.findById(id)
                .map(m -> {
                    if (dto.getNumeroInventaire() != null) m.setNumeroInventaire(dto.getNumeroInventaire());
                    if (dto.getNumeroSerie() != null) m.setNumeroSerie(dto.getNumeroSerie());
                    if (dto.getEtat() != null) m.setEtat(dto.getEtat());
                    if (dto.getCaracteristiques() != null) m.setCaracteristiques(dto.getCaracteristiques());
                    if (dto.getObservations() != null) m.setObservations(dto.getObservations());
                    return ResponseEntity.ok(materialRepository.save(m));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMateriel(@PathVariable Long id) {
        if (!materialRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        materialRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/numero-inventaire/{numero}")
    public ResponseEntity<Material> getByNumeroInventaire(@PathVariable String numero) {
        return materialRepository.findByNumeroInventaire(numero)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/numero-serie/{numero}")
    public ResponseEntity<Material> getByNumeroSerie(@PathVariable String numero) {
        return materialRepository.findByNumeroSerie(numero)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ SOLUTION : Spécifier explicitement le type générique avec <Material>
    @PutMapping("/{id}/numero-inventaire")
    public ResponseEntity<Material> assignerNumeroInventaire(
            @PathVariable Long id,
            @RequestParam String numeroInventaire) {

        return materialRepository.findById(id)
                .map(materiel -> {
                    if (materialRepository.existsByNumeroInventaire(numeroInventaire)) {
                        return ResponseEntity.badRequest().<Material>build(); // ✅ FIX ICI
                    }
                    materiel.setNumeroInventaire(numeroInventaire);
                    return ResponseEntity.ok(materialRepository.save(materiel));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ SOLUTION : Spécifier explicitement le type générique avec <Material>
    @PutMapping("/{id}/numero-serie")
    public ResponseEntity<Material> assignerNumeroSerie(
            @PathVariable Long id,
            @RequestParam String numeroSerie) {

        return materialRepository.findById(id)
                .map(materiel -> {
                    if (materialRepository.existsByNumeroSerie(numeroSerie)) {
                        return ResponseEntity.badRequest().<Material>build(); // ✅ FIX ICI
                    }
                    materiel.setNumeroSerie(numeroSerie);
                    return ResponseEntity.ok(materialRepository.save(materiel));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/achat/{achatId}")
    public ResponseEntity<List<Material>> getMaterielsByAchat(@PathVariable Long achatId) {
        return ResponseEntity.ok(materialRepository.findByAchatId(achatId));
    }


    // affectation et reafectation



    /**
     * Libérer un matériel (retirer l'attribution)
     */
    @PostMapping("/{id}/liberer")
    public ResponseEntity<Material> libererMateriel(@PathVariable Long id) {
        Material materiel = materialService.libererMateriel(id);
        return ResponseEntity.ok(materiel);
    }

    /**
     * Obtenir tous les matériels attribués
     */


    /**
     * Obtenir l'historique d'attribution d'un matériel
     * (À implémenter avec une entité HistoriqueAttribution si besoin)
     */
    @GetMapping("/{id}/historique")
    public ResponseEntity<?> getHistoriqueAttribution(@PathVariable Long id) {
        // À implémenter si nécessaire
        return ResponseEntity.ok().build();
    }

    // Ajoutez ces endpoints dans votre MaterialController

    /**
     * Attribuer une configuration complète de matériels à un bénéficiaire
     */
    @PostMapping("/affectation-complete")
    public ResponseEntity<?> affecterConfigurationComplete(@RequestBody AffectationCompleteDTO dto) {
        try {
            List<Material> materielsAttribues = materialService.affecterConfigurationComplete(dto);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Attribution complète de " + materielsAttribues.size() + " matériel(s) effectuée avec succès",
                    "materielsAttribues", materielsAttribues
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Obtenir les matériels disponibles groupés par prix/designation pour un achat
     */
    @GetMapping("/achat/{achatId}/disponibles-par-prix")
    public ResponseEntity<?> getMaterielsDisponiblesParPrix(@PathVariable Long achatId) {
        try {
            Map<String, List<Material>> materielsParPrix = materialService.getMaterielsDisponiblesParPrix(achatId);
            return ResponseEntity.ok(materielsParPrix);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * ✅ NOUVEL ENDPOINT : Récupérer les matériels disponibles pour un prix spécifique
     */
    @GetMapping("/prix/{prixId}/disponibles")
    public ResponseEntity<List<Material>> getMaterielsDisponiblesParPrix2(
            @PathVariable Long prixId) {
        try {
            List<Material> materiels = materialService.getMaterielsDisponiblesParPrixId(prixId);
            return ResponseEntity.ok(materiels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    /**
     * ✅ NOUVEL ENDPOINT : Récupérer les matériels attribués par achat et bénéficiaire
     */
    @GetMapping("/achat/{achatId}/beneficiaire/{beneficiaireId}/attribues")
    public ResponseEntity<List<Material>> getMaterielsAttribuesParAchatEtBeneficiaire(
            @PathVariable Long achatId,
            @PathVariable Long beneficiaireId) {
        try {
            List<Material> materiels = materialService.getMaterielsAttribuesParAchatEtBeneficiaire(achatId, beneficiaireId);
            return ResponseEntity.ok(materiels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * ✅ NOUVEL ENDPOINT : Récupérer tous les bénéficiaires avec leurs matériels pour un achat
     */
    @GetMapping("/achat/{achatId}/prise-en-charge")
    public ResponseEntity<?> getPriseEnChargeByAchat(@PathVariable Long achatId) {
        try {
            Map<Beneficiaire, List<Material>> priseEnCharge = materialService.getPriseEnChargeByAchat(achatId);

            // ✅ Convertir en DTO pour éviter les problèmes de sérialisation
            List<PriseEnChargeDTO> dtoList = priseEnCharge.entrySet().stream()
                    .map(entry -> new PriseEnChargeDTO(entry.getKey(), entry.getValue()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtoList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * ✅ NOUVEL ENDPOINT : Préparer les matériels (assigner N° série et inventaire)
     * POST /api/materiels/preparation/{prixId}
     */
    @PostMapping("/preparation/{prixId}")
    public ResponseEntity<List<Material>> preparerMateriels(
            @PathVariable Long prixId,
            @RequestBody List<MaterielPreparationDTO> preparationData) {

        List<Material> materielsPrepares = materialService.preparerMateriels(prixId, preparationData);
        return ResponseEntity.ok(materielsPrepares);
    }

    /**
     * ✅ NOUVEL ENDPOINT : Récupérer les matériels par prix
     * GET /api/materiels/prix/{prixId}
     */
    @GetMapping("/prix/{prixId}")
    public ResponseEntity<List<Material>> getMaterielsByPrix(@PathVariable Long prixId) {
        List<Material> materiels = materialService.getMaterielsByPrix(prixId);
        return ResponseEntity.ok(materiels);
    }
}