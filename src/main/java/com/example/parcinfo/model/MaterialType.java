package com.example.parcinfo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "types_materiel")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La désignation est obligatoire")
    @Column(nullable = false, unique = true)
    private String designation; // Ex: "MICRO-ORDINATEUR", "IMPRIMANTE"

    // ✅ SUPPRIMÉ : caracteristiquesObligatoires

    @Column(columnDefinition = "TEXT")
    private String description;

    public boolean isMicroOrdinateur() {
        return designation != null &&
                designation.toUpperCase().contains("ORDINATEUR");
    }

    public boolean isImprimante() {
        return designation != null &&
                designation.toUpperCase().contains("IMPRIMANTE");
    }
}