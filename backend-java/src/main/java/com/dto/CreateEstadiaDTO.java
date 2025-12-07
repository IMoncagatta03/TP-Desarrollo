package com.dto;

import java.time.LocalDate;
import java.util.List;

public class CreateEstadiaDTO {
    private String idResponsable;
    private List<String> idsAcompanantes;
    private String idHabitacion;
    private LocalDate fechaDesde;
    private LocalDate fechaHasta;

    public String getIdResponsable() {
        return idResponsable;
    }

    public void setIdResponsable(String idResponsable) {
        this.idResponsable = idResponsable;
    }

    public List<String> getIdsAcompanantes() {
        return idsAcompanantes;
    }

    public void setIdsAcompanantes(List<String> idsAcompanantes) {
        this.idsAcompanantes = idsAcompanantes;
    }

    public String getIdHabitacion() {
        return idHabitacion;
    }

    public void setIdHabitacion(String idHabitacion) {
        this.idHabitacion = idHabitacion;
    }

    public LocalDate getFechaDesde() {
        return fechaDesde;
    }

    public void setFechaDesde(LocalDate fechaDesde) {
        this.fechaDesde = fechaDesde;
    }

    public LocalDate getFechaHasta() {
        return fechaHasta;
    }

    public void setFechaHasta(LocalDate fechaHasta) {
        this.fechaHasta = fechaHasta;
    }
}
