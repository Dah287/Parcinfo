package com.example.parcinfo.controller;


import com.example.parcinfo.dto.PrixDTO;
import com.example.parcinfo.model.Prix;
import com.example.parcinfo.repository.PrixRepository;
import com.example.parcinfo.service.AchatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prix")
@RequiredArgsConstructor
public class PrixController {

    @Autowired
    PrixRepository prixRepository;

    @GetMapping
    public ResponseEntity<List<Prix>> getAllPrix() {
        return ResponseEntity.ok(prixRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prix> getPrixById(@PathVariable Long id) {
        return prixRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/achat/{achatId}")
    public ResponseEntity<List<Prix>> getPrixByAchat(@PathVariable Long achatId) {
        return ResponseEntity.ok(prixRepository.findByAchatId(achatId));
    }


    //

    @Autowired
    AchatService achatService;

    @PostMapping("/achats/{achatId}/prix")
    public ResponseEntity<Void> ajouterPrix(
            @PathVariable Long achatId,
            @Valid @RequestBody List<PrixDTO> prixDTOList) {
        achatService.ajouterPrixAchat(achatId, prixDTOList);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{prixId}")
    public ResponseEntity<Prix> updatePrix(
            @PathVariable Long achatId,
            @PathVariable Long prixId,
            @Valid @RequestBody PrixDTO prixDTO) {
        return ResponseEntity.ok(achatService.updatePrix(prixId, prixDTO));
    }

    @DeleteMapping("/{prixId}")
    public ResponseEntity<Void> deletePrix(
            @PathVariable Long achatId,
            @PathVariable Long prixId) {
        achatService.deletePrix(prixId);
        return ResponseEntity.noContent().build();
    }

    // ✅ NOUVEL ENDPOINT : Nombre de prix par achat
    @GetMapping("/achat/{achatId}/count")
    public ResponseEntity<Map<String, Object>> countPrixByAchat(@PathVariable Long achatId) {
        long count = prixRepository.countByAchatId(achatId);
        Map<String, Object> response = new HashMap<>();
        response.put("achatId", achatId);
        response.put("nombrePrix", count);
        response.put("message", count + " prix trouvés pour cet achat");
        return ResponseEntity.ok(response);
    }
}
