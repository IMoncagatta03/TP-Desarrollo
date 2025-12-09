package com.service;

import com.dto.HabitacionEstadoDTO;
import com.enums.EstadoEstadia;
import com.enums.EstadoHab;
import com.enums.TipoCama;
import com.model.Estadia;
import com.model.Habitacion;
import com.model.Reserva;
import com.repository.EstadiaRepository;
import com.repository.HabitacionRepository;
import com.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HabitacionService {

    @Autowired
    private HabitacionRepository habitacionRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private EstadiaRepository estadiaRepository;

    public List<HabitacionEstadoDTO> obtenerEstadoHabitaciones(LocalDate fechaDesde, LocalDate fechaHasta) {
        List<Habitacion> habitaciones = habitacionRepository.findAll();
        List<Reserva> reservas = reservaRepository.findReservasEnRango(fechaDesde, fechaHasta);
        List<Estadia> estadias = estadiaRepository.findEstadiasEnRango(fechaDesde, fechaHasta);

        List<HabitacionEstadoDTO> resultado = new ArrayList<>();

        for (Habitacion hab : habitaciones) {
            Map<String, String> estadosPorFecha = new HashMap<>();
            Map<String, String> detallesPorFecha = new HashMap<>();
            LocalDate current = fechaDesde;

            while (!current.isAfter(fechaHasta)) {
                String estado = EstadoHab.LIBRE.name(); // Default

                // Check Estadia
                for (Estadia est : estadias) {
                    if (est.getHabitacion().getNumero().equals(hab.getNumero()) &&
                            !current.isBefore(est.getFechaDesde()) &&
                            !current.isAfter(est.getFechaHasta())) {

                        // Usar el estado de la estadia
                        if (est.getEstado() != null) {
                            if (est.getEstado() == EstadoEstadia.VIGENTE
                                    || est.getEstado() == EstadoEstadia.PLAZO_EXTENDIDO) {
                                estado = EstadoHab.OCUPADO.name();
                            } else if (est.getEstado() == EstadoEstadia.FINALIZADA
                                    || est.getEstado() == EstadoEstadia.FINALIZADO_OBLIGATORIO) {
                                estado = EstadoHab.LIBRE.name();
                            }
                        } else {
                            estado = EstadoHab.OCUPADO.name();
                        }
                        if (estado.equals(EstadoHab.OCUPADO.name())) {
                            break;
                        }
                    }
                }

                // Checkear reserva
                if (estado.equals(EstadoHab.LIBRE.name())) {
                    for (Reserva res : reservas) {
                        if (res.getHabitacion().getNumero().equals(hab.getNumero()) &&
                                !current.isBefore(res.getFechaDesde()) &&
                                !current.isAfter(res.getFechaHasta())) {
                            estado = EstadoHab.RESERVADO.name();
                            detallesPorFecha.put(current.toString(), res.getNombres() + " " + res.getApellido());
                            break;
                        }
                    }
                }

                estadosPorFecha.put(current.toString(), estado);
                current = current.plusDays(1);
            }

            List<String> camas = new ArrayList<>();
            if (hab.getCamas() != null) {
                for (TipoCama cama : hab.getCamas()) {
                    camas.add(cama.name());
                }
            }

            resultado.add(
                    new HabitacionEstadoDTO(hab.getNumero(), hab.getTipo(), estadosPorFecha, detallesPorFecha, camas));
        }

        return resultado;
    }
}
