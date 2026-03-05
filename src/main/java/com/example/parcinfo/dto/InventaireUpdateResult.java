package com.example.parcinfo.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventaireUpdateResult {

    private int updatedCount;
    private int skippedCount;
    private List<String> warnings;     // Numéros de série non trouvés
    private List<String> errors;       // Conflits d'unicité, etc.

    public static InventaireUpdateResult success(int count) {
        return new InventaireUpdateResult(count, 0, List.of(), List.of());
    }
}