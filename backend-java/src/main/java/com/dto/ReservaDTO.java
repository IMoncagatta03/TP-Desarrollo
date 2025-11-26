package com.dto;

import java.time.LocalDate;

public class ReservaDTO {
    private String numeroHabitacion;
    private LocalDate fechaDesde;
    private LocalDate fechaHasta;
    private String nombres;
    private String apellido;
    private String telefono;

    public ReservaDTO() {
    }

    public ReservaDTO(String numeroHabitacion, LocalDate fechaDesde, LocalDate fechaHasta, String nombres,
            String apellido, String telefono) {
        this.numeroHabitacion = numeroHabitacion;
        this.fechaDesde = fechaDesde;
        this.fechaHasta = fechaHasta;
        this.nombres = nombres;
        this.apellido = apellido;
        this.telefono = telefono;
    }

    public String getNumeroHabitacion() {
        return numeroHabitacion;
    }

    public void setNumeroHabitacion(String numeroHabitacion) {
        this.numeroHabitacion = numeroHabitacion;
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

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}
