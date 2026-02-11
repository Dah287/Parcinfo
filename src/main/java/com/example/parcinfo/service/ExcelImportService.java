package com.example.parcinfo.service;

import com.example.parcinfo.dto.ExcelImportDTO;
import com.example.parcinfo.model.Achat;
import com.example.parcinfo.model.Fournisseur;
import com.example.parcinfo.model.Material;
import com.example.parcinfo.model.Prix;
import com.example.parcinfo.repository.AchatRepository;
import com.example.parcinfo.repository.FournisseurRepository;
import com.example.parcinfo.repository.MaterialRepository;
import com.example.parcinfo.repository.PrixRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExcelImportService {

    @Autowired
    private AchatRepository achatRepository;

    @Autowired
    private PrixRepository prixRepository;

    @Autowired
    private FournisseurRepository fournisseurRepository;

    @Autowired
    private MaterialGenerationService materialGenerationService;

    @Autowired
    private MaterialRepository materialRepository;

    @Transactional
    public ImportResult importerPrix(MultipartFile file, Long achatId) {
        ImportResult result = new ImportResult();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);

            Achat achat = achatRepository.findById(achatId)
                    .orElseThrow(() -> new RuntimeException("Achat non trouvé"));

            // Récupérer le fournisseur depuis l'achat
            Fournisseur fournisseur = achat.getFournisseur();
            if (fournisseur == null) {
                throw new RuntimeException("L'achat n'a pas de fournisseur associé");
            }

            // Vérifier si le fichier a le bon format
            if (sheet.getLastRowNum() < 1) {
                throw new RuntimeException("Le fichier Excel est vide");
            }

            // Récupérer tous les prix existants pour cet achat
            List<Prix> prixExistants = prixRepository.findByAchatId(achatId);

            // Lire les lignes (saute la première ligne d'en-tête)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    ExcelImportDTO dto = lireLignePrix(row);
                    result.totalLignes++;

                    // Vérifier si ce prix existe déjà (par numéro de prix)
                    Optional<Prix> prixExistantOpt = trouverPrixParNumero(prixExistants, dto.getNumeroPrix());

                    if (prixExistantOpt.isPresent()) {
                        // Mettre à jour le prix existant
                        Prix prixExistant = prixExistantOpt.get();

                        prixExistant.setDesignation(dto.getDesignation());
                        prixExistant.setUnite(dto.getUnite());
                        prixExistant.setQuantite(dto.getQuantite());
                        prixExistant.setPrixUnitaireHT(dto.getPrixUnitaireHT());

                        prixRepository.save(prixExistant);
                        result.lignesMiseAJour++;
                    } else {
                        // Créer un nouveau prix
                        Prix nouveauPrix = Prix.builder()
                                .numeroPrix(dto.getNumeroPrix())
                                .designation(dto.getDesignation())
                                .unite(dto.getUnite())
                                .quantite(dto.getQuantite())
                                .prixUnitaireHT(dto.getPrixUnitaireHT())
                                .achat(achat)
                                .build();

                        nouveauPrix = prixRepository.save(nouveauPrix);

                        // Générer les matériels avec le fournisseur de l'achat
                        List<Material> materiels = materialGenerationService.genererMateriels(nouveauPrix, fournisseur);
                        materialRepository.saveAll(materiels);

                        nouveauPrix.setMateriels(materiels);
                        prixRepository.save(nouveauPrix);

                        result.lignesImportees++;
                    }

                } catch (Exception e) {
                    result.erreurs.add("Ligne " + (i + 1) + ": " + e.getMessage());
                    result.lignesEnErreur++;
                }
            }

            result.succes = true;

        } catch (IOException e) {
            result.succes = false;
            result.messageErreur = "Erreur lors de la lecture du fichier: " + e.getMessage();
        }

        return result;
    }

    // Ajoutez aussi la méthode remplacerPrix
    @Transactional
    public ImportResult remplacerPrix(MultipartFile file, Long achatId) {
        Achat achat = achatRepository.findById(achatId)
                .orElseThrow(() -> new RuntimeException("Achat non trouvé"));

        // Supprimer tous les prix existants pour cet achat
        List<Prix> prixExistants = prixRepository.findByAchatId(achatId);

        // Supprimer d'abord les matériels associés
        for (Prix prix : prixExistants) {
            if (prix.getMateriels() != null && !prix.getMateriels().isEmpty()) {
                materialRepository.deleteAll(prix.getMateriels());
            }
        }

        // Puis supprimer les prix
        prixRepository.deleteAll(prixExistants);

        // Importer les nouveaux prix
        return importerPrix(file, achatId);
    }

    private Optional<Prix> trouverPrixParNumero(List<Prix> prixList, String numeroPrix) {
        if (numeroPrix == null || prixList == null) {
            return Optional.empty();
        }

        return prixList.stream()
                .filter(p -> p.getNumeroPrix() != null &&
                        p.getNumeroPrix().equals(numeroPrix))
                .findFirst();
    }

    private ExcelImportDTO lireLignePrix(Row row) {
        ExcelImportDTO dto = new ExcelImportDTO();

        // Format Excel attendu (5 colonnes sans observations) :
        // 0: Numéro Prix
        // 1: Désignation
        // 2: Unité
        // 3: Quantité
        // 4: Prix unitaire HT

        dto.setNumeroPrix(getStringCellValue(row.getCell(0)));
        dto.setDesignation(getStringCellValue(row.getCell(1)));
        dto.setUnite(getStringCellValue(row.getCell(2)));
        dto.setQuantite(getIntegerCellValue(row.getCell(3)));
        dto.setPrixUnitaireHT(getBigDecimalCellValue(row.getCell(4)));

        // Validation
        if (dto.getNumeroPrix() == null || dto.getNumeroPrix().trim().isEmpty()) {
            throw new RuntimeException("Numéro de prix manquant");
        }
        if (dto.getDesignation() == null || dto.getDesignation().trim().isEmpty()) {
            throw new RuntimeException("Désignation manquante");
        }
        if (dto.getQuantite() == null || dto.getQuantite() <= 0) {
            throw new RuntimeException("Quantité invalide: " + dto.getQuantite());
        }
        if (dto.getPrixUnitaireHT() == null || dto.getPrixUnitaireHT().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Prix unitaire invalide: " + dto.getPrixUnitaireHT());
        }

        return dto;
    }

    private String getStringCellValue(Cell cell) {
        if (cell == null) return null;

        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            double value = cell.getNumericCellValue();
            if (value == Math.floor(value)) {
                return String.valueOf((int) value);
            } else {
                return String.valueOf(value);
            }
        } else if (cell.getCellType() == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        } else if (cell.getCellType() == CellType.FORMULA) {
            try {
                return cell.getStringCellValue();
            } catch (Exception e) {
                try {
                    return String.valueOf(cell.getNumericCellValue());
                } catch (Exception ex) {
                    return null;
                }
            }
        }
        return null;
    }

    private Integer getIntegerCellValue(Cell cell) {
        if (cell == null) return null;

        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) Math.round(cell.getNumericCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                return Integer.parseInt(cell.getStringCellValue().trim());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private BigDecimal getBigDecimalCellValue(Cell cell) {
        if (cell == null) return BigDecimal.ZERO;

        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue())
                    .setScale(2, BigDecimal.ROUND_HALF_UP);
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                String value = cell.getStringCellValue().trim()
                        .replace(",", ".")
                        .replace(" ", "");
                return new BigDecimal(value).setScale(2, BigDecimal.ROUND_HALF_UP);
            } catch (NumberFormatException e) {
                return BigDecimal.ZERO;
            }
        }
        return BigDecimal.ZERO;
    }

    @lombok.Data
    public static class ImportResult {
        private boolean succes = false;
        private int totalLignes = 0;
        private int lignesImportees = 0;
        private int lignesMiseAJour = 0;
        private int lignesEnErreur = 0;
        private String messageErreur;
        private List<String> erreurs = new ArrayList<>();
    }
}