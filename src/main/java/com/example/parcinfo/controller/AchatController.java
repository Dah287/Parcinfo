package com.example.parcinfo.controller;


import com.example.parcinfo.dto.AchatDTO;
import com.example.parcinfo.model.Achat;
import com.example.parcinfo.model.Prix;
import com.example.parcinfo.service.AchatService;
import com.example.parcinfo.service.ExcelImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/achats")
@RequiredArgsConstructor
public class AchatController {

    @Autowired
    AchatService achatService;
    @Autowired
    ExcelImportService excelImportService;
    @PostMapping
    public ResponseEntity<Achat> creerAchat(@Valid @RequestBody AchatDTO dto) {
        Achat achat = achatService.creerAchat(dto);
        return ResponseEntity.created(URI.create("/api/achats/" + achat.getId()))
                .body(achat);
    }

    @GetMapping
    public ResponseEntity<List<Achat>> getAllAchats() {
        return ResponseEntity.ok(achatService.getAllAchats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Achat> getAchatById(@PathVariable Long id) {
        return ResponseEntity.ok(achatService.getAchatById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Achat>> searchAchats(@RequestParam String keyword) {
        return ResponseEntity.ok(achatService.searchAchats(keyword));
    }

    @GetMapping("/{id}/prix")
    public ResponseEntity<List<Prix>> getPrixByAchat(@PathVariable Long id) {
        return ResponseEntity.ok(achatService.getPrixByAchatId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Achat> updateAchat(
            @PathVariable Long id,
            @Valid @RequestBody AchatDTO dto) {
        return ResponseEntity.ok(achatService.updateAchat(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAchat(@PathVariable Long id) {
        achatService.deleteAchat(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAchats", achatService.getAllAchats().size());
        stats.put("totalMontant", achatService.getAllAchats().stream()
                .mapToDouble(a -> a.getMontantTotalHT().doubleValue())
                .sum());
        return ResponseEntity.ok(stats);
    }

    // Ajouter cet endpoint pour l'importation Excel
    @PostMapping("/{id}/import-prix")
    public ResponseEntity<ExcelImportService.ImportResult> importerPrixExcel(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) { // Enlever fournisseurId

        ExcelImportService.ImportResult result =
                excelImportService.importerPrix(file, id);

        if (result.isSucces()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @PostMapping("/{id}/remplacer-prix")
    public ResponseEntity<ExcelImportService.ImportResult> remplacerPrixExcel(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        ExcelImportService.ImportResult result =
                excelImportService.remplacerPrix(file, id);

        if (result.isSucces()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // Ajouter un endpoint pour récupérer tous les prix d'un achat
//    @GetMapping("/{id}/prix")
//    public ResponseEntity<List<Prix>> getPrixByAchat(@PathVariable Long id) {
//        return ResponseEntity.ok(achatService.getPrixByAchatId(id));
//    }
}