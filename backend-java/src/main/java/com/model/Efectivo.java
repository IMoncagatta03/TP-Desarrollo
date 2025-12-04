package com.model;

import jakarta.persistence.*;

@Entity
@Table(name = "efectivo")
@PrimaryKeyJoinColumn(name = "id_metodo")
public class Efectivo extends MetodoDePago {

    @Column(length = 10)
    private String moneda = "ARS";

    public String getMoneda() {
        return moneda;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }
}
