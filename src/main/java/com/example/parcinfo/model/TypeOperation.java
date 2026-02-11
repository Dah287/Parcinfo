package com.example.parcinfo.model;


public enum TypeOperation {
    ATTRIBUTION_INITIALE("Attribution initiale"),
    REAFFECTATION("Réaffectation"),
    LIBERATION("Libération"),
    RETOUR_STOCK("Retour en stock");

    private final String libelle;

    TypeOperation(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}