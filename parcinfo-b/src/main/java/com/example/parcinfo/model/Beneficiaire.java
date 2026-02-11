package com.example.parcinfo.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "beneficiaires")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Beneficiaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false)
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Column(nullable = false)
    private String prenom;

    @Column
    private String telephone;

    @Column
    private String email;

    @NotBlank(message = "Le département est obligatoire")
    @Column(nullable = false)
    private String departement;

    @Column
    private String fonction;

    @OneToMany(mappedBy = "beneficiaire", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Material> materiels = new ArrayList<>();

    public String getNomComplet() {
        return nom + " " + prenom;
    }
}