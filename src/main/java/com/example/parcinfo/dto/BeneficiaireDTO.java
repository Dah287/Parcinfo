package com.example.parcinfo.dto;


import com.example.parcinfo.model.Beneficiaire;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BeneficiaireDTO {

    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    private String telephone;
    private String email;

    @NotBlank(message = "Le département est obligatoire")
    private String departement;

    private String fonction;

    public Beneficiaire toEntity() {
        return Beneficiaire.builder()
                .nom(nom)
                .prenom(prenom)
                .telephone(telephone)
                .email(email)
                .departement(departement)
                .fonction(fonction)
                .build();
    }
}