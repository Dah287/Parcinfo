package com.example.parcinfo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.HashMap;
import java.util.Map;

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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "caracteristiques_obligatoires",  joinColumns = @JoinColumn(name = "type_id"))
    @MapKeyColumn(name = "cle")
    @Column(name = "valeur")
    private Map<String, String> caracteristiquesObligatoires = new HashMap<>();

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