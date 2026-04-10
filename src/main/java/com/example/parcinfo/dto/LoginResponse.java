package com.example.parcinfo.dto;

import java.util.List;

public class LoginResponse {
    private Long id;
    private String matricule;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private List<String> permissions;
    private String token;
    private String type = "Bearer";

    public LoginResponse() {}

    public LoginResponse(Long id, String matricule, String nom, String prenom,
                         String email, String role, List<String> permissions, String token) {
        this.id = id;
        this.matricule = matricule;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.role = role;
        this.permissions = permissions;
        this.token = token;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
