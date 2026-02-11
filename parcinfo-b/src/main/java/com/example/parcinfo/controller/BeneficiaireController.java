package com.example.parcinfo.controller;

import com.example.parcinfo.dto.BeneficiaireDTO;
import com.example.parcinfo.model.Beneficiaire;
import com.example.parcinfo.service.BeneficiaireService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/beneficiaires")
@RequiredArgsConstructor
public class BeneficiaireController {

    @Autowired
    BeneficiaireService beneficiaireService;

    @GetMapping
    public ResponseEntity<List<Beneficiaire>> getAllBeneficiaires() {
        return ResponseEntity.ok(beneficiaireService.getAllBeneficiaires());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Beneficiaire> getBeneficiaireById(@PathVariable Long id) {
        return beneficiaireService.getBeneficiaireById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Beneficiaire>> searchBeneficiaires(@RequestParam String keyword) {
        return ResponseEntity.ok(beneficiaireService.searchBeneficiaires(keyword));
    }

    @GetMapping("/departement/{departement}")
    public ResponseEntity<List<Beneficiaire>> getBeneficiairesByDepartement(@PathVariable String departement) {
        return ResponseEntity.ok(beneficiaireService.getBeneficiairesByDepartement(departement));
    }

    @PostMapping
    public ResponseEntity<Beneficiaire> createBeneficiaire(@Valid @RequestBody BeneficiaireDTO dto) {
        Beneficiaire beneficiaire = beneficiaireService.createBeneficiaire(dto);
        return ResponseEntity.created(URI.create("/api/beneficiaires/" + beneficiaire.getId()))
                .body(beneficiaire);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Beneficiaire> updateBeneficiaire(
            @PathVariable Long id,
            @Valid @RequestBody BeneficiaireDTO dto) {
        return ResponseEntity.ok(beneficiaireService.updateBeneficiaire(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBeneficiaire(@PathVariable Long id) {
        if (!beneficiaireService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        beneficiaireService.deleteBeneficiaire(id);
        return ResponseEntity.noContent().build();
    }
}