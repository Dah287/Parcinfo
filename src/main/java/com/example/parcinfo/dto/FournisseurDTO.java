package com.example.parcinfo.dto;


import com.example.parcinfo.model.Fournisseur;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FournisseurDTO {

    private Long id;

    @NotBlank(message = "Le code fournisseur est obligatoire")
    @Pattern(regexp = "F\\d{5}", message = "Le code doit être au format F00000")
    private String code;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String adresse;
    private String telephone;
    private String email;
    private String contactPrincipal;

    public Fournisseur toEntity() {
        return Fournisseur.builder()
                .code(code)
                .nom(nom)
                .adresse(adresse)
                .telephone(telephone)
                .email(email)
                .contactPrincipal(contactPrincipal)
                .build();
    }
}