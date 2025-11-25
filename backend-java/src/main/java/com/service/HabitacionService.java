package com.service;

import com.dto.HabitacionEstadoDTO;
import com.enums.EstadoEstadia;
import com.enums.EstadoHab;
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
            LocalDate current = fechaDesde;

            while (!current.isAfter(fechaHasta)) {
                String estado = EstadoHab.LIBRE.name(); // Default

                // Check Estadia (Priority 1)
                for (Estadia est : estadias) {
                    if (est.getHabitacion().getNumero().equals(hab.getNumero()) &&
                            !current.isBefore(est.getFechaDesde()) &&
                            !current.isAfter(est.getFechaHasta())) {

                        // Use Estadia status if available and maps to EHab, otherwise default to
                        // OCUPADO
                        // Assuming Estadia.estado is a String that might match EHab names or be
                        // specific
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

                        // If the status determined from Estadia is OCUPADO, we stop checking.
                        // If it is LIBRE (because it finished), we continue to check other stays or
                        // reservations?
                        // Actually, if there is a stay that is FINALIZED on this day, does it mean the
                        // room is free?
                        // Usually yes, unless there's another stay starting the same day?
                        // The loop iterates over all stays. If we find one that makes it OCUPADO, we
                        // break.
                        if (estado.equals(EstadoHab.OCUPADO.name())) {
                            break;
                        }
                        // If it remains LIBRE (e.g. found a finalized stay), we keep checking other
                        // stays.
                    }
                }

                // Check Reserva (Priority 2) - Only if still LIBRE
                if (estado.equals(EstadoHab.LIBRE.name())) {
                    for (Reserva res : reservas) {
                        if (res.getHabitacion().getNumero().equals(hab.getNumero()) &&
                                !current.isBefore(res.getFechaDesde()) &&
                                !current.isAfter(res.getFechaHasta())) {
                            estado = EstadoHab.RESERVADO.name();
                            break;
                        }
                    }
                }

                estadosPorFecha.put(current.toString(), estado);
                current = current.plusDays(1);
            }

            resultado.add(new HabitacionEstadoDTO(hab.getNumero(), hab.getTipo(), estadosPorFecha));
        }

        return resultado;
    }
}
