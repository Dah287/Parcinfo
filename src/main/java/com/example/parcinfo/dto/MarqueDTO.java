package com.example.parcinfo.dto;


import com.example.parcinfo.model.Marque;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarqueDTO {

    private Long id;

    @NotBlank(message = "Le nom de la marque est obligatoire")
    private String nom;

    private String paysOrigine;

    public Marque toEntity() {
        return Marque.builder()
                .nom(nom)
                .paysOrigine(paysOrigine)
                .build();
    }
}