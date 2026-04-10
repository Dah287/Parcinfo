package com.example.parcinfo.repository;

import com.example.parcinfo.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByMatricule(String matricule);

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByMatricule(String matricule);

    boolean existsByEmail(String email);

    @Modifying
    @Transactional
    @Query("UPDATE Utilisateur u SET u.tentativeConnexion = u.tentativeConnexion + 1 WHERE u.matricule = :matricule")
    void incrementerTentativeConnexion(@Param("matricule") String matricule);

    @Modifying
    @Transactional
    @Query("UPDATE Utilisateur u SET u.tentativeConnexion = 0, u.derniereConnexion = :date WHERE u.matricule = :matricule")
    void reinitialiserTentatives(@Param("matricule") String matricule, @Param("date") LocalDateTime date);

    @Modifying
    @Transactional
    @Query("UPDATE Utilisateur u SET u.compteNonVerrouille = false, u.dernierVerrouillage = :date WHERE u.matricule = :matricule")
    void verrouillerCompte(@Param("matricule") String matricule, @Param("date") LocalDateTime date);

    @Modifying
    @Transactional
    @Query("UPDATE Utilisateur u SET u.compteNonVerrouille = true, u.tentativeConnexion = 0 WHERE u.matricule = :matricule")
    void deverrouillerCompte(@Param("matricule") String matricule);
}