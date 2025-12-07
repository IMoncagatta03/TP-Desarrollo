package com.model;

import com.enums.EstadoEstadia;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "estadia")
public class Estadia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_huesped", referencedColumnName = "numero_documento")
    private Huesped huesped;

    @OneToOne
    @JoinColumn(name = "id_reserva", referencedColumnName = "id")
    private Reserva reserva;

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

    @ManyToMany
    @JoinTable(name = "estadia_huespedes", joinColumns = @JoinColumn(name = "id_estadia"), inverseJoinColumns = @JoinColumn(name = "id_huesped"))
    private List<Huesped> acompanantes;

    public Estadia() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Huesped getHuesped() {
        return huesped;
    }

    public void setHuesped(Huesped huesped) {
        this.huesped = huesped;
    }

    public List<Huesped> getAcompanantes() {
        return acompanantes;
    }

    public void setAcompanantes(List<Huesped> acompanantes) {
        this.acompanantes = acompanantes;
    }

    public Reserva getReserva() {
        return reserva;
    }

    public void setReserva(Reserva reserva) {
        this.reserva = reserva;
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
