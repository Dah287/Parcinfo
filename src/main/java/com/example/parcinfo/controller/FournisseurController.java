package com.example.parcinfo.controller;


import com.example.parcinfo.dto.FournisseurDTO;
import com.example.parcinfo.model.Fournisseur;
import com.example.parcinfo.repository.FournisseurRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/fournisseurs")
@RequiredArgsConstructor
public class FournisseurController {

    @Autowired
    FournisseurRepository fournisseurRepository;

    @GetMapping
    public ResponseEntity<List<Fournisseur>> getAllFournisseurs() {
        return ResponseEntity.ok(fournisseurRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fournisseur> getFournisseurById(@PathVariable Long id) {
        return fournisseurRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Fournisseur>> searchFournisseurs(@RequestParam String keyword) {
        return ResponseEntity.ok(fournisseurRepository.searchByKeyword(keyword));
    }

    @PostMapping
    public ResponseEntity<Fournisseur> createFournisseur(@Valid @RequestBody FournisseurDTO dto) {
        if (fournisseurRepository.existsByCode(dto.getCode())) {
            return ResponseEntity.badRequest().build();
        }
        Fournisseur fournisseur = dto.toEntity();
        fournisseur = fournisseurRepository.save(fournisseur);
        return ResponseEntity.created(URI.create("/api/fournisseurs/" + fournisseur.getId()))
                .body(fournisseur);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fournisseur> updateFournisseur(
            @PathVariable Long id,
            @Valid @RequestBody FournisseurDTO dto) {
        return fournisseurRepository.findById(id)
                .map(f -> {
                    f.setNom(dto.getNom());
                    f.setAdresse(dto.getAdresse());
                    f.setTelephone(dto.getTelephone());
                    f.setEmail(dto.getEmail());
                    f.setContactPrincipal(dto.getContactPrincipal());
                    return ResponseEntity.ok(fournisseurRepository.save(f));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFournisseur(@PathVariable Long id) {
        if (!fournisseurRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        fournisseurRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}