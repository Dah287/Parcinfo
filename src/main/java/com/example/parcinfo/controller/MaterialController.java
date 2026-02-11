package com.example.parcinfo.controller;

import com.example.parcinfo.dto.AttributionMaterialDTO;
import com.example.parcinfo.dto.MaterialDTO;
import com.example.parcinfo.model.Material;
import com.example.parcinfo.repository.MaterialRepository;
import com.example.parcinfo.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
}