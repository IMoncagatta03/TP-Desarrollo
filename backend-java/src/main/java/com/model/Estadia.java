package com.model;

import com.enums.EstadoEstadia;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "estadia")
public class Estadia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_desde")
    private LocalDate fechaDesde;

    @Column(name = "fecha_hasta")
    private LocalDate fechaHasta;

    @ManyToOne
    @JoinColumn(name = "num_habitacion", referencedColumnName = "numero")
    private Habitacion habitacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoEstadia estado;

    public Estadia() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public EstadoEstadia getEstado() {
        return estado;
    }

    public void setEstado(EstadoEstadia estado) {
        this.estado = estado;
    }
}
