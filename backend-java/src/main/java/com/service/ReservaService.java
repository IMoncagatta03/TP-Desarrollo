package com.service;

import com.dto.ReservaDTO;
import com.model.Habitacion;
import com.model.Reserva;
import com.repository.HabitacionRepository;
import com.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private HabitacionRepository habitacionRepository;

    @Transactional
    public List<Reserva> crearReservas(List<ReservaDTO> reservasDTO) {
        List<Reserva> nuevasReservas = new ArrayList<>();

        for (ReservaDTO dto : reservasDTO) {
            // 1. Buscar la habitación
            Habitacion habitacion = habitacionRepository.findById(dto.getNumeroHabitacion())
                    .orElseThrow(() -> new RuntimeException("Habitación no encontrada: " + dto.getNumeroHabitacion()));

            // 2. Verificar disponibilidad
            List<Reserva> reservasExistentes = reservaRepository.findReservasDeHabitacionEnRango(
                    habitacion, dto.getFechaDesde(), dto.getFechaHasta());

            if (!reservasExistentes.isEmpty()) {
                throw new RuntimeException(
                        "La habitación " + habitacion.getNumero() + " no está disponible en el rango seleccionado.");
            }

            // 3. Crear la reserva
            Reserva reserva = new Reserva();
            reserva.setHabitacion(habitacion);
            reserva.setFechaDesde(dto.getFechaDesde());
            reserva.setFechaHasta(dto.getFechaHasta());
            reserva.setNombres(dto.getNombres());
            reserva.setApellido(dto.getApellido());
            reserva.setTelefono(dto.getTelefono());

            nuevasReservas.add(reserva);
        }

        return reservaRepository.saveAll(nuevasReservas);
    }
}
