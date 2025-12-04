package com.model;

import jakarta.persistence.*;

@Entity
@Table(name = "persona_fisica")
@PrimaryKeyJoinColumn(name = "id_responsable")
public class PersonaFisica extends ResponsableDePago {

    @OneToOne
    @JoinColumn(name = "numero_documento", referencedColumnName = "numero_documento", nullable = false, unique = true)
    private Huesped huesped;

    public Huesped getHuesped() {
        return huesped;
    }

    public void setHuesped(Huesped huesped) {
        this.huesped = huesped;
    }
}
