package com.dto;

import com.enums.TipoHab;

import java.util.List;
import java.util.Map;

public class HabitacionEstadoDTO {
    private String numero;
    private TipoHab tipo;
    private Map<String, String> estadosPorFecha;
    private List<String> camas;

    private Map<String, String> detallesPorFecha;

    public HabitacionEstadoDTO() {
    }

    public HabitacionEstadoDTO(String numero, TipoHab tipo, Map<String, String> estadosPorFecha,
            Map<String, String> detallesPorFecha, List<String> camas) {
        this.numero = numero;
        this.tipo = tipo;
        this.estadosPorFecha = estadosPorFecha;
        this.detallesPorFecha = detallesPorFecha;
        this.camas = camas;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public TipoHab getTipo() {
        return tipo;
    }

    public void setTipo(TipoHab tipo) {
        this.tipo = tipo;
    }

    public Map<String, String> getEstadosPorFecha() {
        return estadosPorFecha;
    }

    public void setEstadosPorFecha(Map<String, String> estadosPorFecha) {
        this.estadosPorFecha = estadosPorFecha;
    }

    public Map<String, String> getDetallesPorFecha() {
        return detallesPorFecha;
    }

    public void setDetallesPorFecha(Map<String, String> detallesPorFecha) {
        this.detallesPorFecha = detallesPorFecha;
    }

    public List<String> getCamas() {
        return camas;
    }

    public void setCamas(List<String> camas) {
        this.camas = camas;
    }
}
