package com.example.parcinfo.dto;

import com.example.parcinfo.model.Material;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributionMaterialDTO {

    @NotNull(message = "L'ID du matériel est obligatoire")
    private Long materielId;

    @NotNull(message = "L'ID du bénéficiaire est obligatoire")
    private Long beneficiaireId;

    private LocalDate dateAttribution;
}