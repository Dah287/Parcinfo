package com.example.parcinfo.controller;
import com.example.parcinfo.dto.AchatDTO;
import com.example.parcinfo.dto.PrixDTO;
import com.example.parcinfo.model.prix.Prix;
import com.example.parcinfo.service.PrixService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// controller/PrixController.java
@RestController
@RequestMapping("/api/prix")
@CrossOrigin(origins = "*")
public class PrixController {

    @Autowired
    private PrixService prixService;

    @PostMapping("/import/{achatId}")
    public ResponseEntity<PrixDTO> importPrix(
            @PathVariable Long achatId,
            @RequestParam("file") MultipartFile file) {
        Prix prix = prixService.importPrixFromExcel(file, achatId);
        return ResponseEntity.ok(convertToDTO(prix));
    }

    @PostMapping
    public ResponseEntity<PrixDTO> createPrix(@RequestBody PrixDTO prixDTO) {
        Prix prix = convertToEntity(prixDTO);
        Prix savedPrix = prixService.savePrix(prix);
        return ResponseEntity.ok(convertToDTO(savedPrix));
    }
}