package com.model;

import jakarta.persistence.*;

@Entity
@Table(name = "factura")
public class Factura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tipo_factura", nullable = false, length = 1)
    private String tipoFactura;

    @Column(name = "estado_factura", nullable = false, length = 20)
    private String estadoFactura;

    @Column(name = "monto_total", nullable = false)
    private Double montoTotal;

    @ManyToOne
    @JoinColumn(name = "id_estadia")
    private Estadia estadia;

    @ManyToOne
    @JoinColumn(name = "id_responsable_pago")
    private ResponsableDePago responsableDePago;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTipoFactura() {
        return tipoFactura;
    }

    public void setTipoFactura(String tipoFactura) {
        this.tipoFactura = tipoFactura;
    }

    public String getEstadoFactura() {
        return estadoFactura;
    }

    public void setEstadoFactura(String estadoFactura) {
        this.estadoFactura = estadoFactura;
    }

    public Double getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(Double montoTotal) {
        this.montoTotal = montoTotal;
    }

    public Estadia getEstadia() {
        return estadia;
    }

    public void setEstadia(Estadia estadia) {
        this.estadia = estadia;
    }

    public ResponsableDePago getResponsableDePago() {
        return responsableDePago;
    }

    public void setResponsableDePago(ResponsableDePago responsableDePago) {
        this.responsableDePago = responsableDePago;
    }
}
