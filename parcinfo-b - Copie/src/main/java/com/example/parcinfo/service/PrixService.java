package com.example.parcinfo.service;

import com.example.parcinfo.dto.PrixLineDTO;
import com.example.parcinfo.exception.ImportException;
import com.example.parcinfo.model.prix.Prix;
import com.example.parcinfo.model.prix.PrixLine;
import com.example.parcinfo.repository.PrixLineRepository;
import com.example.parcinfo.repository.PrixRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

// service/PrixService.java
@Service
@Transactional
public class PrixService {

    @Autowired
    private PrixRepository prixRepository;

    @Autowired
    private PrixLineRepository prixLineRepository;

    @Autowired
    private ExcelImportService excelImportService;

    public Prix savePrix(Prix prix) {
        return prixRepository.save(prix);
    }

    public Prix importPrixFromExcel(MultipartFile file, Long achatId) {
        try {
            List<PrixLineDTO> prixLines = excelImportService.importPrixFromExcel(file);

            Prix prix = new Prix();
            prix.setNumeroPrix(generateNumeroPrix());
            prix.setAchat(achatRepository.findById(achatId).orElseThrow());

            List<PrixLine> lines = new ArrayList<>();
            for (int i = 0; i < prixLines.size(); i++) {
                PrixLineDTO dto = prixLines.get(i);
                PrixLine line = convertToPrixLineEntity(dto);
                line.setPrix(prix);
                line.setNumeroLigne(i + 1);
                lines.add(line);
            }

            prix.setPrixLines(lines);
            return prixRepository.save(prix);

        } catch (IOException e) {
            throw new ImportException("Erreur lors de l'import du fichier Excel", e);
        }
    }

    private String generateNumeroPrix() {
        // Logique de génération de numéro de prix
        return "PRIX-" + System.currentTimeMillis();
    }
}

