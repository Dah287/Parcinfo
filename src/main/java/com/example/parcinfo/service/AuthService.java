package com.example.parcinfo.service;

import com.example.parcinfo.Sec.UserPrincipal;
import com.example.parcinfo.config.JwtUtil;
import com.example.parcinfo.dto.*;
import com.example.parcinfo.model.Utilisateur;
import com.example.parcinfo.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ===============================
    // 🔹 AUTHENTIFICATION & INSCRIPTION
    // ===============================

    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        // Vérifier si l'utilisateur existe
        Utilisateur utilisateur = utilisateurRepository.findByMatricule(loginRequest.getMatricule())
                .orElseThrow(() -> new RuntimeException("Matricule ou mot de passe incorrect"));

        // Vérifier si le compte est verrouillé
        if (!utilisateur.isCompteNonVerrouille()) {
            LocalDateTime dernierVerrouillage = utilisateur.getDernierVerrouillage();
            if (dernierVerrouillage != null && dernierVerrouillage.plusMinutes(1).isAfter(LocalDateTime.now())) {
                throw new RuntimeException("Compte verrouillé. Veuillez réessayer dans 1 minute.");
            } else {
                utilisateurRepository.deverrouillerCompte(loginRequest.getMatricule());
            }
        }

        // Vérifier si le compte est actif
        if (!utilisateur.isActif()) {
            throw new RuntimeException("Compte désactivé. Veuillez contacter l'administrateur.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getMatricule(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            utilisateurRepository.reinitialiserTentatives(loginRequest.getMatricule(), LocalDateTime.now());

            UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails.getUsername(), userDetails.getRole(), loginRequest.isRememberMe());

            List<String> permissions = userDetails.getPermissions();
            if (permissions == null) {
                permissions = new ArrayList<>();
            }

            return new LoginResponse(
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getNom(),
                    userDetails.getPrenom(),
                    userDetails.getEmail(),
                    userDetails.getRole(),
                    permissions,
                    jwt);

        } catch (Exception e) {
            utilisateurRepository.incrementerTentativeConnexion(loginRequest.getMatricule());
            utilisateur = utilisateurRepository.findByMatricule(loginRequest.getMatricule()).orElse(null);
            if (utilisateur != null && utilisateur.getTentativeConnexion() >= 3) {
                utilisateurRepository.verrouillerCompte(loginRequest.getMatricule(), LocalDateTime.now());
                throw new RuntimeException("Compte verrouillé après 3 tentatives infructueuses. Veuillez réessayer dans 1 minute.");
            }
            throw new RuntimeException("Matricule ou mot de passe incorrect");
        }
    }

    public RegisterResponse registerUser(RegisterRequest registerRequest) {
        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            throw new RuntimeException("Les mots de passe ne correspondent pas");
        }

        if (utilisateurRepository.existsByMatricule(registerRequest.getMatricule())) {
            throw new RuntimeException("Le matricule " + registerRequest.getMatricule() + " existe déjà");
        }

        if (utilisateurRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("L'email " + registerRequest.getEmail() + " est déjà utilisé");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setMatricule(registerRequest.getMatricule());
        utilisateur.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        utilisateur.setNom(registerRequest.getNom());
        utilisateur.setPrenom(registerRequest.getPrenom());
        utilisateur.setEmail(registerRequest.getEmail());
        utilisateur.setTelephone(registerRequest.getTelephone());
        utilisateur.setRole(registerRequest.getRole());
        utilisateur.setActif(true);
        utilisateur.setCompteNonVerrouille(true);
        utilisateur.setTentativeConnexion(0);
        utilisateur.setCreatedAt(LocalDateTime.now());
        utilisateur.setUpdatedAt(LocalDateTime.now());

        List<String> defaultPermissions = new ArrayList<>();
        if ("ADMIN".equals(registerRequest.getRole())) {
            defaultPermissions.add("all");
        } else {
            defaultPermissions.add("read");
            defaultPermissions.add("write");
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            utilisateur.setPermissions(mapper.writeValueAsString(defaultPermissions));
        } catch (Exception e) {
            utilisateur.setPermissions("[\"read\",\"write\"]");
        }

        Utilisateur savedUser = utilisateurRepository.save(utilisateur);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getMatricule(),
                savedUser.getNom(),
                savedUser.getPrenom(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "Utilisateur créé avec succès"
        );
    }

    // ===============================
    // 🔹 GESTION DES UTILISATEURS (CRUD)
    // ===============================

    @Transactional(readOnly = true)
    public List<Utilisateur> getAllUsers() {
        return utilisateurRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Utilisateur getUserById(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id: " + id));
    }

    @Transactional
    public RegisterResponse createUser(RegisterRequest registerRequest) {
        // Vérifier si les mots de passe correspondent (optionnel pour création admin)
        if (registerRequest.getPassword() != null && !registerRequest.getPassword().isEmpty()) {
            if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
                throw new RuntimeException("Les mots de passe ne correspondent pas");
            }
        } else {
            // Mot de passe par défaut
            String defaultPassword = "default123";
            registerRequest.setPassword(defaultPassword);
            registerRequest.setConfirmPassword(defaultPassword);
        }

        // Vérifier si le matricule existe déjà
        if (utilisateurRepository.existsByMatricule(registerRequest.getMatricule())) {
            throw new RuntimeException("Le matricule " + registerRequest.getMatricule() + " existe déjà");
        }

        // Vérifier si l'email existe déjà
        if (utilisateurRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("L'email " + registerRequest.getEmail() + " est déjà utilisé");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setMatricule(registerRequest.getMatricule());
        utilisateur.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        utilisateur.setNom(registerRequest.getNom());
        utilisateur.setPrenom(registerRequest.getPrenom());
        utilisateur.setEmail(registerRequest.getEmail());
        utilisateur.setTelephone(registerRequest.getTelephone());
        utilisateur.setRole(registerRequest.getRole());
        utilisateur.setActif(true);
        utilisateur.setCompteNonVerrouille(true);
        utilisateur.setTentativeConnexion(0);
        utilisateur.setCreatedAt(LocalDateTime.now());
        utilisateur.setUpdatedAt(LocalDateTime.now());

        List<String> defaultPermissions = new ArrayList<>();
        if ("ADMIN".equals(registerRequest.getRole())) {
            defaultPermissions.add("all");
        } else {
            defaultPermissions.add("read");
            defaultPermissions.add("write");
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            utilisateur.setPermissions(mapper.writeValueAsString(defaultPermissions));
        } catch (Exception e) {
            utilisateur.setPermissions("[\"read\",\"write\"]");
        }

        Utilisateur savedUser = utilisateurRepository.save(utilisateur);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getMatricule(),
                savedUser.getNom(),
                savedUser.getPrenom(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "Utilisateur créé avec succès"
        );
    }

    @Transactional
    public RegisterResponse updateUser(Long id, UpdateUserRequest updateRequest) {
        Utilisateur utilisateur = getUserById(id);

        // Vérifier si le nouveau matricule existe déjà (sauf pour l'utilisateur actuel)
        if (!utilisateur.getMatricule().equals(updateRequest.getMatricule()) &&
                utilisateurRepository.existsByMatricule(updateRequest.getMatricule())) {
            throw new RuntimeException("Le matricule " + updateRequest.getMatricule() + " existe déjà");
        }

        // Vérifier si le nouvel email existe déjà (sauf pour l'utilisateur actuel)
        if (!utilisateur.getEmail().equals(updateRequest.getEmail()) &&
                utilisateurRepository.existsByEmail(updateRequest.getEmail())) {
            throw new RuntimeException("L'email " + updateRequest.getEmail() + " est déjà utilisé");
        }

        // Mettre à jour les champs obligatoires
        utilisateur.setMatricule(updateRequest.getMatricule());
        utilisateur.setNom(updateRequest.getNom());
        utilisateur.setPrenom(updateRequest.getPrenom());
        utilisateur.setEmail(updateRequest.getEmail());
        utilisateur.setTelephone(updateRequest.getTelephone());
        utilisateur.setRole(updateRequest.getRole());
        utilisateur.setUpdatedAt(LocalDateTime.now());

        // ✅ Mettre à jour le mot de passe SEULEMENT si fourni et non vide
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().trim().isEmpty()) {
            // Vérifier la confirmation
            if (updateRequest.getConfirmPassword() == null ||
                    !updateRequest.getPassword().equals(updateRequest.getConfirmPassword())) {
                throw new RuntimeException("Les mots de passe ne correspondent pas");
            }
            // Vérifier la longueur minimale
            if (updateRequest.getPassword().length() < 6) {
                throw new RuntimeException("Le mot de passe doit contenir au moins 6 caractères");
            }
            utilisateur.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }

        // Mettre à jour les permissions selon le nouveau rôle
        List<String> permissions = new ArrayList<>();
        if ("ADMIN".equals(updateRequest.getRole())) {
            permissions.add("all");
        } else {
            permissions.add("read");
            permissions.add("write");
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            utilisateur.setPermissions(mapper.writeValueAsString(permissions));
        } catch (Exception e) {
            utilisateur.setPermissions("[\"read\",\"write\"]");
        }

        Utilisateur savedUser = utilisateurRepository.save(utilisateur);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getMatricule(),
                savedUser.getNom(),
                savedUser.getPrenom(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "Utilisateur modifié avec succès"
        );
    }

    @Transactional
    public void deleteUser(Long id) {
        Utilisateur utilisateur = getUserById(id);
        utilisateurRepository.delete(utilisateur);
    }

    @Transactional
    public void toggleUserStatus(Long id, boolean actif) {
        Utilisateur utilisateur = getUserById(id);
        utilisateur.setActif(actif);
        utilisateur.setUpdatedAt(LocalDateTime.now());
        utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void resetPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Le mot de passe doit contenir au moins 6 caractères");
        }

        Utilisateur utilisateur = getUserById(id);
        utilisateur.setPassword(passwordEncoder.encode(newPassword));
        utilisateur.setUpdatedAt(LocalDateTime.now());
        utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void updateUserRole(Long id, String role) {
        Utilisateur utilisateur = getUserById(id);
        utilisateur.setRole(role);
        utilisateur.setUpdatedAt(LocalDateTime.now());

        // Mettre à jour les permissions selon le nouveau rôle
        List<String> permissions = new ArrayList<>();
        if ("ADMIN".equals(role)) {
            permissions.add("all");
        } else {
            permissions.add("read");
            permissions.add("write");
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            utilisateur.setPermissions(mapper.writeValueAsString(permissions));
        } catch (Exception e) {
            utilisateur.setPermissions("[\"read\",\"write\"]");
        }

        utilisateurRepository.save(utilisateur);
    }
}