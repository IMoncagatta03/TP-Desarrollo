package com.model;

import jakarta.persistence.*;

@Entity
@Table(name = "responsable_de_pago")
@Inheritance(strategy = InheritanceType.JOINED)
public class ResponsableDePago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tipo_responsable", nullable = false, length = 20)
    private String tipoResponsable;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTipoResponsable() {
        return tipoResponsable;
    }

    public void setTipoResponsable(String tipoResponsable) {
        this.tipoResponsable = tipoResponsable;
    }
}
