package com.dto;

import com.enums.TipoHab;

import java.util.Map;

public class HabitacionEstadoDTO {
    private String numero;
    private TipoHab tipo;
    private Map<String, String> estadosPorFecha; // Key: Date (ISO String), Value: Status (String representation of EHab
                                                 // or custom)

    public HabitacionEstadoDTO() {
    }

    public HabitacionEstadoDTO(String numero, TipoHab tipo, Map<String, String> estadosPorFecha) {
        this.numero = numero;
        this.tipo = tipo;
        this.estadosPorFecha = estadosPorFecha;
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
}
