package com.model;

import com.enums.EstadoHab;
import com.enums.TipoHab;
import jakarta.persistence.*;

@Entity
@Table(name = "habitacion")
public class Habitacion {

    @Id
    @Column(name = "numero", length = 3)
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 15, nullable = false)
    private EstadoHab estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", length = 20, nullable = false)
    private TipoHab tipo;

    public Habitacion() {
    }

    public Habitacion(String numero, EstadoHab estado, TipoHab tipo) {
        this.numero = numero;
        this.estado = estado;
        this.tipo = tipo;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public EstadoHab getEstado() {
        return estado;
    }

    public void setEstado(EstadoHab estado) {
        this.estado = estado;
    }

    public TipoHab getTipo() {
        return tipo;
    }

    public void setTipo(TipoHab tipo) {
        this.tipo = tipo;
    }
}
