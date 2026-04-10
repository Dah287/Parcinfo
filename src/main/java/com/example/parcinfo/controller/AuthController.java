// AuthController.java - Ajoutez cette méthode
package com.example.parcinfo.controller;

import com.example.parcinfo.dto.*;
import com.example.parcinfo.model.Utilisateur;
import com.example.parcinfo.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Login existant
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false, 400));
        }
    }

    // Nouvelle méthode d'inscription
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            RegisterResponse response = authService.registerUser(registerRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false, 400));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        return ResponseEntity.ok(new MessageResponse("Déconnexion réussie", true, 200));
    }


    // AuthController.java - Ajoutez ces méthodes

    // Récupérer tous les utilisateurs
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<Utilisateur> users = authService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false, 400));
        }
    }

    // Récupérer un utilisateur par ID
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Utilisateur user = authService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false, 400));
        }
    }

    // Créer un utilisateur
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            RegisterResponse response = authService.createUser(registerRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false, 400));
        }
    }

    // Mettre à jour un utilisateur
// Mettre à jour un utilisateur
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @Valid @RequestBody UpdateUserRequest updateRequest) {  // ✅ Utilisez UpdateUserRequest
        try {
            RegisterResponse response = authService.updateUser(id, updateRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false, 400));
        }
    }

    // Supprimer un utilisateur
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            authService.deleteUser(id);
            return ResponseEntity.ok(new MessageResponse("Utilisateur supprimé avec succès", true, 200));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false, 400));
        }
    }

    // Activer/Désactiver un utilisateur
    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        try {
            authService.toggleUserStatus(id, body.get("actif"));
            return ResponseEntity.ok(new MessageResponse("Statut modifié avec succès", true, 200));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false, 400));
        }
    }

    // Réinitialiser mot de passe
    @PutMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            authService.resetPassword(id, body.get("password"));
            return ResponseEntity.ok(new MessageResponse("Mot de passe réinitialisé avec succès", true, 200));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false, 400));
        }
    }
}