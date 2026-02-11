package com.example.parcinfo.controller;


import com.example.parcinfo.service.ExcelImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
public class ExcelImportController {

//   @Autowired
//   ExcelImportService excelImportService;
//
//    @PostMapping("/prix")
//    public ResponseEntity<Map<String, Object>> importerPrix(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam Long achatId,
//            @RequestParam Long fournisseurId) {
//
//        ExcelImportService.ImportResult result =
//                excelImportService.importerPrix(file, achatId, fournisseurId);
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("succes", result.isSucces());
//        response.put("totalLignes", result.getTotalLignes());
//        response.put("lignesImportees", result.getLignesImportees());
//        response.put("lignesEnErreur", result.getLignesEnErreur());
//
//        if (!result.isSucces()) {
//            response.put("erreur", result.getMessageErreur());
//        }
//        if (!result.getErreurs().isEmpty()) {
//            response.put("detailsErreurs", result.getErreurs());
//        }
//
//        return ResponseEntity.ok(response);
//    }
}