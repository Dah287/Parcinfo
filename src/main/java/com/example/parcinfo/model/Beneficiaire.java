package com.example.parcinfo.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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
@ToString(exclude = {"materiels"})
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

//    public String getNomComplet() {
//        return nom + " " + prenom;
//    }

    // ✅ Champs calculés pour le frontend
    @Transient
    @JsonProperty("nomComplet")
    public String getNomComplet() {
        return this.nom + " " + this.prenom;
    }

//    @Transient
//    @JsonProperty("departementNom")
//    public String getDepartementNom() {
//        return this.departement != null ? this. : null;
//    }
//
//    @Transient
//    @JsonProperty("serviceNom")
//    public String getServiceNom() {
//        return this.service != null ? this.service.getNom() : null;
//    }
}