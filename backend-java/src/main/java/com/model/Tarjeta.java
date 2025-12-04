package com.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tarjeta")
@PrimaryKeyJoinColumn(name = "id_metodo")
public class Tarjeta extends MetodoDePago {

    @Column(name = "nro_tarjeta", nullable = false, length = 20)
    private String nroTarjeta;

    @Column(nullable = false, length = 50)
    private String titular;

    @Column(nullable = false, length = 4)
    private String csv;

    @Column(nullable = false, length = 5)
    private String vencimiento;

    @Column(name = "tipo_tarjeta", nullable = false, length = 10)
    private String tipoTarjeta;

    @Column(columnDefinition = "integer default 1")
    private Integer cuotas = 1;

    public String getNroTarjeta() {
        return nroTarjeta;
    }

    public void setNroTarjeta(String nroTarjeta) {
        this.nroTarjeta = nroTarjeta;
    }

    public String getTitular() {
        return titular;
    }

    public void setTitular(String titular) {
        this.titular = titular;
    }

    public String getCsv() {
        return csv;
    }

    public void setCsv(String csv) {
        this.csv = csv;
    }

    public String getVencimiento() {
        return vencimiento;
    }

    public void setVencimiento(String vencimiento) {
        this.vencimiento = vencimiento;
    }

    public String getTipoTarjeta() {
        return tipoTarjeta;
    }

    public void setTipoTarjeta(String tipoTarjeta) {
        this.tipoTarjeta = tipoTarjeta;
    }

    public Integer getCuotas() {
        return cuotas;
    }

    public void setCuotas(Integer cuotas) {
        this.cuotas = cuotas;
    }
}
