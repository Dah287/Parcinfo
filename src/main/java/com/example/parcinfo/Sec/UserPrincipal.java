package com.example.parcinfo.Sec;


import com.example.parcinfo.model.Utilisateur;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String matricule;
    private String email;
    private String password;
    private String nom;
    private String prenom;
    private String role;
    private List<String> permissions;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String matricule, String email, String password,
                         String nom, String prenom, String role, List<String> permissions,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.matricule = matricule;
        this.email = email;
        this.password = password;
        this.nom = nom;
        this.prenom = prenom;
        this.role = role;
        this.permissions = permissions;
        this.authorities = authorities;
    }

    public static UserPrincipal build(Utilisateur utilisateur) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + utilisateur.getRole()));

        List<String> permissions = new ArrayList<>();
        if (utilisateur.getPermissions() != null && !utilisateur.getPermissions().isEmpty()) {
            try {
                tools.jackson.databind.ObjectMapper mapper = new tools.jackson.databind.ObjectMapper();
                permissions = mapper.readValue(utilisateur.getPermissions(), new tools.jackson.core.type.TypeReference<List<String>>() {});
                for (String permission : permissions) {
                    authorities.add(new SimpleGrantedAuthority(permission));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return new UserPrincipal(
                utilisateur.getId(),
                utilisateur.getMatricule(),
                utilisateur.getEmail(),
                utilisateur.getPassword(),
                utilisateur.getNom(),
                utilisateur.getPrenom(),
                utilisateur.getRole(),
                permissions,
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return matricule;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // Getters supplémentaires
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public String getRole() { return role; }
    public List<String> getPermissions() { return permissions; }
}