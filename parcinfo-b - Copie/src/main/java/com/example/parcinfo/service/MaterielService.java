package com.example.parcinfo.service;

import com.example.parcinfo.exception.ResourceNotFoundException;
import com.example.parcinfo.model.materiel.Ecran;
import com.example.parcinfo.model.materiel.Materiel;
import com.example.parcinfo.model.materiel.TypeMateriel;
import com.example.parcinfo.model.prix.Prix;
import com.example.parcinfo.model.prix.PrixLine;
import com.example.parcinfo.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

// service/MaterielService.java
// service/MaterielService.java
@Service
@Transactional
public class MaterielService {

    @Autowired
    private MaterielRepository materielRepository;

    @Autowired
    private TypeMaterielRepository typeMaterielRepository;

    @Autowired
    private MarqueRepository marqueRepository;

    public List<Materiel> createMaterielsFromPrixLine(PrixLine prixLine, Prix prix) {
        List<Materiel> materiels = new ArrayList<>();
        TypeMateriel type = determineTypeMaterielFromDesignation(prixLine.getDesignation());

        if (type == null) {
            throw new IllegalArgumentException("Type de matériel non trouvé pour: " + prixLine.getDesignation());
        }

        for (int i = 0; i < prixLine.getQuantite(); i++) {
            Materiel materiel = new Materiel();
            materiel.setDesignation(prixLine.getDesignation());
            materiel.setTypeMateriel(type);
            materiel.setPrix(prix);
            materiel.setDateAcquisition(prix.getAchat().getDateReception());
            materiel.setStatut(StatutMateriel.EN_STOCK);

            // Si c'est un micro-ordinateur, marquer comme nécessitant inventaire
            if (Boolean.TRUE.equals(type.getNecessiteEcran())) {
                materiel.setEstInventorie(false);
                materiel.setCommentaire("Nécessite association d'un écran");
            } else {
                materiel.setEstInventorie(true);
            }

            // Calculer la date de fin de garantie
            if (prix.getAchat().getGarantieAnnees() != null) {
                Calendar cal = Calendar.getInstance();
                cal.setTime(materiel.getDateAcquisition());
                cal.add(Calendar.YEAR, prix.getAchat().getGarantieAnnees());
                materiel.setDateFinGarantie(cal.getTime());
            }

            Materiel savedMateriel = materielRepository.save(materiel);
            materiels.add(savedMateriel);
        }

        return materiels;
    }

    private TypeMateriel determineTypeMaterielFromDesignation(String designation) {
        String designationUpper = designation.toUpperCase();

        // Chercher d'abord dans la base de données
        List<TypeMateriel> types = typeMaterielRepository.findAll();

        for (TypeMateriel type : types) {
            if (designationUpper.contains(type.getLibelle().toUpperCase()) ||
                    designationUpper.contains(type.getCode().toUpperCase())) {
                return type;
            }
        }

        // Si non trouvé, créer un type par défaut
        return createDefaultTypeForDesignation(designation);
    }

    private TypeMateriel createDefaultTypeForDesignation(String designation) {
        TypeMateriel type = new TypeMateriel();

        if (designation.contains("MICRO-ORDINATEUR")) {
            type.setCode("MICRO_ORD");
            type.setLibelle("Micro-ordinateur");
            type.setNecessiteEcran(true);
            type.setCategorie("ORDINATEUR");
        } else if (designation.contains("PC PORTABLE I5")) {
            type.setCode("PC_PORT_I5");
            type.setLibelle("PC Portable I5");
            type.setNecessiteEcran(false);
            type.setCategorie("ORDINATEUR");
        } else if (designation.contains("IMPRIMANTE A3")) {
            type.setCode("IMP_A3");
            type.setLibelle("Imprimante A3");
            type.setNecessiteEcran(false);
            type.setCategorie("IMPRIMANTE");
        }
        // ... autres types

        type.setActif(true);
        return typeMaterielRepository.save(type);
    }

    public Materiel associateEcran(Long materielId, Long ecranId) {
        Materiel materiel = materielRepository.findById(materielId)
                .orElseThrow(() -> new ResourceNotFoundException("Matériel non trouvé"));

        Materiel ecran = materielRepository.findById(ecranId)
                .orElseThrow(() -> new ResourceNotFoundException("Écran non trouvé"));

        // Vérifier que le matériel nécessite un écran
        if (!Boolean.TRUE.equals(materiel.getTypeMateriel().getNecessiteEcran())) {
            throw new IllegalArgumentException("Ce type de matériel ne nécessite pas d'écran");
        }

        // Vérifier que l'écran est de type approprié
        if (!"ECRAN".equalsIgnoreCase(ecran.getTypeMateriel().getCategorie())) {
            throw new IllegalArgumentException("Le matériel spécifié n'est pas un écran");
        }

        materiel.setEcran(ecran);
        materiel.setEstInventorie(true);
        materiel.setNumeroSerieEcran(ecran.getNumeroSerie());

        return materielRepository.save(materiel);
    }

    public List<Materiel> getMaterielsSansEcran() {
        return materielRepository.findMaterielsSansEcran();
    }

    public List<Materiel> getEcransDisponibles() {
        return materielRepository.findEcransDisponibles();
    }
}