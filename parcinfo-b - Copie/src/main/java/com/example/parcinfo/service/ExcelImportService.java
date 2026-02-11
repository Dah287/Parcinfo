package com.example.parcinfo.service;

import com.example.parcinfo.dto.PrixLineDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

// service/ExcelImportService.java
@Service
public class ExcelImportService {

    public List<PrixLineDTO> importPrixFromExcel(MultipartFile file) throws IOException {
        List<PrixLineDTO> prixLines = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // Ignorer la première ligne (en-têtes)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    PrixLineDTO dto = new PrixLineDTO();
                    dto.setNumeroLigne(getCellValueAsInt(row.getCell(0)));
                    dto.setDesignation(getCellValueAsString(row.getCell(1)));
                    dto.setUnite(getCellValueAsString(row.getCell(2)));
                    dto.setQuantite(getCellValueAsInt(row.getCell(3)));
                    dto.setPrixUnitaireHT(getCellValueAsBigDecimal(row.getCell(4)));
                    dto.setPrixTotalHT(getCellValueAsBigDecimal(row.getCell(5)));

                    prixLines.add(dto);
                }
            }
        }

        return prixLines;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC: return String.valueOf((int) cell.getNumericCellValue());
            default: return "";
        }
    }
}