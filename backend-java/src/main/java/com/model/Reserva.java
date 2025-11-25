package com.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "reserva")
@IdClass(ReservaId.class)
public class Reserva {

    @Id
    @Column(name = "fecha_desde")
    private LocalDate fechaDesde;

    @Id
    @Column(name = "fecha_hasta")
    private LocalDate fechaHasta;

    @Id
    @ManyToOne
    @JoinColumn(name = "num_habitacion", referencedColumnName = "numero")
    private Habitacion habitacion;

    @Column(name = "nombres", length = 50, nullable = false)
    private String nombres;

    @Column(name = "apellido", length = 50, nullable = false)
    private String apellido;

    @Column(name = "telefono", length = 20, nullable = false)
    private String telefono;

    public Reserva() {
    }

    public Reserva(LocalDate fechaDesde, LocalDate fechaHasta, Habitacion habitacion, String nombres, String apellido,
            String telefono) {
        this.fechaDesde = fechaDesde;
        this.fechaHasta = fechaHasta;
        this.habitacion = habitacion;
        this.nombres = nombres;
        this.apellido = apellido;
        this.telefono = telefono;
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

    public Habitacion getHabitacion() {
        return habitacion;
    }

    public void setHabitacion(Habitacion habitacion) {
        this.habitacion = habitacion;
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
