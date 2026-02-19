package com.example.parcinfo.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fournisseurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"achats", "materiels"}) // ✅ EXCLURE LES RELATIONS DU toString()
public class Fournisseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le code fournisseur est obligatoire")
    @Column(nullable = false, unique = true)
    private String code; // Ex: "F00002"

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false)
    private String nom; // Ex: "BIS"

    @Column
    private String adresse;

    @Column
    private String telephone;

    @Column
    private String email;

    @Column
    private String contactPrincipal;

    @OneToMany(mappedBy = "fournisseur", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Achat> achats = new ArrayList<>();

    @OneToMany(mappedBy = "fournisseur", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Material> materiels = new ArrayList<>();
}