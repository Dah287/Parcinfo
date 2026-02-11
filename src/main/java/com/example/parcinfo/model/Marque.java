package com.example.parcinfo.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "marques")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom de la marque est obligatoire")
    @Column(nullable = false, unique = true)
    private String nom; // Ex: "HP", "DELL", "CANON"

    @Column
    private String paysOrigine;

    @OneToMany(mappedBy = "marque", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Material> materiels = new ArrayList<>();
}
