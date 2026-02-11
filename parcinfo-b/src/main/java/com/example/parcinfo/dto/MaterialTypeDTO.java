package com.example.parcinfo.dto;


import com.example.parcinfo.model.MaterialType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialTypeDTO {

    private Long id;

    @NotBlank(message = "La désignation est obligatoire")
    private String designation;

    private Map<String, String> caracteristiquesObligatoires = new HashMap<>();

    private String description;

    public MaterialType toEntity() {
        return MaterialType.builder()
                .designation(designation)
                .caracteristiquesObligatoires(caracteristiquesObligatoires)
                .description(description)
                .build();
    }
}