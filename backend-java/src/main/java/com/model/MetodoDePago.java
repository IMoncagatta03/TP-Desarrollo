package com.model;

import jakarta.persistence.*;

@Entity
@Table(name = "metodo_de_pago")
@Inheritance(strategy = InheritanceType.JOINED)
public class MetodoDePago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tipo_metodo", nullable = false, length = 20)
    private String tipoMetodo;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTipoMetodo() {
        return tipoMetodo;
    }

    public void setTipoMetodo(String tipoMetodo) {
        this.tipoMetodo = tipoMetodo;
    }
}
