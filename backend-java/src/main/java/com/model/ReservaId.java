package com.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

public class ReservaId implements Serializable {
    private LocalDate fechaDesde;
    private LocalDate fechaHasta;
    private String habitacion; // Matches the type of Habitacion PK

    public ReservaId() {
    }

    public ReservaId(LocalDate fechaDesde, LocalDate fechaHasta, String habitacion) {
        this.fechaDesde = fechaDesde;
        this.fechaHasta = fechaHasta;
        this.habitacion = habitacion;
    }

    // Getters, Setters, equals, and hashCode

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

    public String getHabitacion() {
        return habitacion;
    }

    public void setHabitacion(String habitacion) {
        this.habitacion = habitacion;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        ReservaId reservaId = (ReservaId) o;
        return Objects.equals(fechaDesde, reservaId.fechaDesde) &&
                Objects.equals(fechaHasta, reservaId.fechaHasta) &&
                Objects.equals(habitacion, reservaId.habitacion);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fechaDesde, fechaHasta, habitacion);
    }
}
