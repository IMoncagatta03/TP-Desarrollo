package com.model;

import jakarta.persistence.*;

@Entity
@Table(name = "persona_fisica")
@PrimaryKeyJoinColumn(name = "id_responsable")
public class PersonaFisica extends ResponsableDePago {

    @OneToOne
    @JoinColumn(name = "numero_documento", referencedColumnName = "numero_documento", nullable = false, unique = true)
    private Huesped huesped;

    @Column(name = "cuit", nullable = true, length = 11)
    private String cuit;

    public void setCuit(String cuit) {
        this.cuit = cuit;
    }

    public String getCuit() {
        return cuit;
    }

    @Column(name = "razon_social")
    private String razonSocial;

    public String getRazonSocial() {
        return razonSocial;
    }

    public void setRazonSocial(String razonSocial) {
        this.razonSocial = razonSocial;
    }

    public Huesped getHuesped() {
        return huesped;
    }

    public void setHuesped(Huesped huesped) {
        this.huesped = huesped;
    }
}
