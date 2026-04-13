// DemandeReaffectationGroupeeDTO.java
package com.example.parcinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeReaffectationGroupeeDTO {

    @NotNull(message = "La liste des matériels est obligatoire")
    private List<Long> materielIds;

    @NotNull(message = "L'ID du bénéficiaire destination est obligatoire")
    private Long beneficiaireDestinationId;

    private LocalDate dateTransfert;

    private String observations;

    private Long demandeurId;

    private Long validateurId;
}