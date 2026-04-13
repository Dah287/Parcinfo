// ValidationReaffectationDTO.java
package com.example.parcinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationReaffectationDTO {

    @NotNull(message = "L'ID du matériel est obligatoire")
    private Long materielId;

    @NotNull(message = "L'ID du bénéficiaire est obligatoire")
    private Long beneficiaireId;

    private LocalDate dateAttribution;

    private String observations;

    // Pour la validation à deux niveaux
    private Long userId; // ID de l'utilisateur qui fait la réaffectation
    private Long validatorUserId; // ID de l'utilisateur qui doit valider
}