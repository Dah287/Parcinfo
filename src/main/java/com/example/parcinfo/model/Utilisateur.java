package com.example.parcinfo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateurs")
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String matricule;

    @Column(nullable = false)
    private String password;

    @Column(length = 100)
    private String nom;

    @Column(length = 100)
    private String prenom;

    @Column(unique = true)
    private String email;

    @Column(length = 20)
    private String telephone;

    @Column(nullable = false)
    private String role; // ADMIN, USER, MANAGER

    private boolean actif = true;

    private boolean compteNonVerrouille = true;

    private int tentativeConnexion = 0;

    private LocalDateTime dernierVerrouillage;

    private LocalDateTime derniereConnexion;

    @Column(columnDefinition = "TEXT")
    private String permissions; // Stocké en JSON

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }

    public boolean isCompteNonVerrouille() { return compteNonVerrouille; }
    public void setCompteNonVerrouille(boolean compteNonVerrouille) { this.compteNonVerrouille = compteNonVerrouille; }

    public int getTentativeConnexion() { return tentativeConnexion; }
    public void setTentativeConnexion(int tentativeConnexion) { this.tentativeConnexion = tentativeConnexion; }

    public LocalDateTime getDernierVerrouillage() { return dernierVerrouillage; }
    public void setDernierVerrouillage(LocalDateTime dernierVerrouillage) { this.dernierVerrouillage = dernierVerrouillage; }

    public LocalDateTime getDerniereConnexion() { return derniereConnexion; }
    public void setDerniereConnexion(LocalDateTime derniereConnexion) { this.derniereConnexion = derniereConnexion; }

    public String getPermissions() { return permissions; }
    public void setPermissions(String permissions) { this.permissions = permissions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}