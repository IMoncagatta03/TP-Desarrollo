package com.model;

import jakarta.persistence.*;

@Entity
@Table(name = "nota_credito")
public class NotaCredito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "numero_nota", nullable = false, length = 20)
    private String numeroNota;

    @Column(name = "importe_total", nullable = false)
    private Double importeTotal;

    @OneToOne
    @JoinColumn(name = "id_factura", unique = true)
    private Factura factura;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNumeroNota() {
        return numeroNota;
    }

    public void setNumeroNota(String numeroNota) {
        this.numeroNota = numeroNota;
    }

    public Double getImporteTotal() {
        return importeTotal;
    }

    public void setImporteTotal(Double importeTotal) {
        this.importeTotal = importeTotal;
    }

    public Factura getFactura() {
        return factura;
    }

    public void setFactura(Factura factura) {
        this.factura = factura;
    }
}
