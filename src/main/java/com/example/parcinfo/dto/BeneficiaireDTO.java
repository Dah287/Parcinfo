package com.example.parcinfo.dto;

import com.example.parcinfo.model.*;
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

    @NotBlank(message = "Le matricule est obligatoire")
    private String matricule;

    private String telephone;
    private String email;
    private String fonction;

    @NotNull(message = "Le bureau est obligatoire")
    private Long bureauId;

    @NotNull(message = "Le département est obligatoire")
    private Long departmentId;

    @NotNull(message = "Le service est obligatoire")
    private Long serviceId;

    public Beneficiaire toEntity(Bureau bureau, Department department, Service service) {
        return Beneficiaire.builder()
                .nom(nom)
                .prenom(prenom)
                .matricule(matricule)
                .telephone(telephone)
                .email(email)
                .fonction(fonction)
                .bureau(bureau)
                .department(department)
                .service(service)
                .build();
    }
}