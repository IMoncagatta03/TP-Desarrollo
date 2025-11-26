package com.model;

import com.enums.TipoCama;
import jakarta.persistence.*;

@Entity
@Table(name = "cama")
public class Cama {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "numero_hab", referencedColumnName = "numero")
    private Habitacion habitacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", length = 10, nullable = false)
    private TipoCama tipo;

    public Cama() {
    }

    // ... getters and setters
}
