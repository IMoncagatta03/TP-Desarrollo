package com.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "cheque")
@PrimaryKeyJoinColumn(name = "id_metodo")
public class Cheque extends MetodoDePago {

    @Column(name = "nro_cheque", nullable = false, length = 50)
    private String nroCheque;

    @Column(nullable = false, length = 50)
    private String banco;

    @Column(name = "fecha_cobro")
    private LocalDate fechaCobro;

    public String getNroCheque() {
        return nroCheque;
    }

    public void setNroCheque(String nroCheque) {
        this.nroCheque = nroCheque;
    }

    public String getBanco() {
        return banco;
    }

    public void setBanco(String banco) {
        this.banco = banco;
    }

    public LocalDate getFechaCobro() {
        return fechaCobro;
    }

    public void setFechaCobro(LocalDate fechaCobro) {
        this.fechaCobro = fechaCobro;
    }
}
