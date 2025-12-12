package com.dto;

import com.model.Consumo;
import com.model.Estadia;
import com.model.Huesped;
import java.util.List;

public class DetalleFacturacionDTO {
    private Estadia estadia;
    private List<Huesped> ocupantes;
    private List<Consumo> consumos;
    private Double montoEstadia;
    private Double montoConsumos;
    private Double montoTotal;

    public DetalleFacturacionDTO() {
    }

    public DetalleFacturacionDTO(Estadia estadia, List<Huesped> ocupantes, List<Consumo> consumos, Double montoEstadia,
            Double montoConsumos) {
        this.estadia = estadia;
        this.ocupantes = ocupantes;
        this.consumos = consumos;
        this.montoEstadia = montoEstadia;
        this.montoConsumos = montoConsumos;
        this.montoTotal = montoEstadia + montoConsumos;
    }

    public Estadia getEstadia() {
        return estadia;
    }

    public void setEstadia(Estadia estadia) {
        this.estadia = estadia;
    }

    public List<Huesped> getOcupantes() {
        return ocupantes;
    }

    public void setOcupantes(List<Huesped> ocupantes) {
        this.ocupantes = ocupantes;
    }

    public List<Consumo> getConsumos() {
        return consumos;
    }

    public void setConsumos(List<Consumo> consumos) {
        this.consumos = consumos;
    }

    public Double getMontoEstadia() {
        return montoEstadia;
    }

    public void setMontoEstadia(Double montoEstadia) {
        this.montoEstadia = montoEstadia;
    }

    public Double getMontoConsumos() {
        return montoConsumos;
    }

    public void setMontoConsumos(Double montoConsumos) {
        this.montoConsumos = montoConsumos;
    }

    public Double getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(Double montoTotal) {
        this.montoTotal = montoTotal;
    }
}
