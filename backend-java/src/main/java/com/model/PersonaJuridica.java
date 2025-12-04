package com.model;

import jakarta.persistence.*;

@Entity
@Table(name = "persona_juridica")
@PrimaryKeyJoinColumn(name = "id_responsable")
public class PersonaJuridica extends ResponsableDePago {

    @Column(name = "razon_social", nullable = false, length = 100)
    private String razonSocial;

    @OneToOne
    @JoinColumn(name = "id_direccion", nullable = false, unique = true)
    private Direccion direccion;

    @Column(nullable = false, length = 11)
    private String cuit;

    public String getRazonSocial() {
        return razonSocial;
    }

    public void setRazonSocial(String razonSocial) {
        this.razonSocial = razonSocial;
    }

    public Direccion getDireccion() {
        return direccion;
    }

    public void setDireccion(Direccion direccion) {
        this.direccion = direccion;
    }

    public String getCuit() {
        return cuit;
    }

    public void setCuit(String cuit) {
        this.cuit = cuit;
    }
}
