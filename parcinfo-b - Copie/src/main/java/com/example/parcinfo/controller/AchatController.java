package com.example.parcinfo.controller;


import com.example.parcinfo.dto.AchatDTO;
import com.example.parcinfo.service.AchatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achats")
@RequiredArgsConstructor
public class AchatController {

    private final AchatService achatService;

    @PostMapping
    public ResponseEntity<AchatDTO> createAchat(@Valid @RequestBody AchatCreateDTO achatCreateDTO) {
        AchatDTO createdAchat = achatService.createAchat(achatCreateDTO);
        return new ResponseEntity<>(createdAchat, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AchatDTO> getAchatById(@PathVariable Long id) {
        AchatDTO achat = achatService.getAchatById(id);
        return ResponseEntity.ok(achat);
    }

    @GetMapping
    public ResponseEntity<List<AchatDTO>> getAllAchats() {
        List<AchatDTO> achats = achatService.getAllAchats();
        return ResponseEntity.ok(achats);
    }
}