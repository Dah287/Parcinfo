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

    @NotBlank(message = "Le matricule est obligatoire")
    @Column(nullable = false, unique = true)
    private String matricule;

    @Column
    private String telephone;

    @Column
    private String email;

    @Column
    private String fonction;

    // Relations ManyToOne vers les entités indépendantes
    @ManyToOne
    @JoinColumn(name = "bureau_id")
    private Bureau bureau;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;

    @OneToMany(mappedBy = "beneficiaire", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Material> materiels = new ArrayList<>();

    @Transient
    @JsonProperty("nomComplet")
    public String getNomComplet() {
        return this.nom + " " + this.prenom;
    }

    @Transient
    @JsonProperty("bureauNom")
    public String getBureauNom() {
        return this.bureau != null ? this.bureau.getName() : null;
    }

    @Transient
    @JsonProperty("departmentNom")
    public String getDepartmentNom() {
        return this.department != null ? this.department.getName() : null;
    }

    @Transient
    @JsonProperty("serviceNom")
    public String getServiceNom() {
        return this.service != null ? this.service.getName() : null;
    }
}