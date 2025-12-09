package com.service;

import com.dto.CreateEstadiaDTO;
import com.enums.EstadoEstadia;
import com.model.Estadia;
import com.model.Habitacion;
import com.model.Huesped;
import com.repository.EstadiaRepository;
import com.repository.HabitacionRepository;
import com.repository.HuespedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class EstadiaService {

    @Autowired
    private EstadiaRepository estadiaRepository;

    @Autowired
    private HuespedRepository huespedRepository;

    @Autowired
    private HabitacionRepository habitacionRepository;

    @Transactional
    public Estadia createEstadia(CreateEstadiaDTO dto) {
        Huesped responsable = huespedRepository.findById(dto.getIdResponsable())
                .orElseThrow(() -> new RuntimeException("Responsable no encontrado"));

        List<Huesped> acompanantes = new ArrayList<>();
        if (dto.getIdsAcompanantes() != null && !dto.getIdsAcompanantes().isEmpty()) {
            acompanantes = huespedRepository.findAllById(dto.getIdsAcompanantes());
            if (acompanantes.size() != dto.getIdsAcompanantes().size()) {
                throw new RuntimeException("Algunos acompañantes no fueron encontrados");
            }
        }

        Habitacion habitacion = habitacionRepository.findById(dto.getIdHabitacion())
                .orElseThrow(() -> new RuntimeException("Habitación no encontrada"));

        Estadia estadia = new Estadia();
        estadia.setHuesped(responsable);
        estadia.setAcompanantes(acompanantes);
        estadia.setHabitacion(habitacion);
        estadia.setFechaDesde(dto.getFechaDesde());
        estadia.setFechaHasta(dto.getFechaHasta());
        estadia.setEstado(EstadoEstadia.VIGENTE); // Asumiendo estado inicial VIGENTE

        return estadiaRepository.save(estadia);
    }

    @Transactional
    public Estadia updateEstadia(Integer id, CreateEstadiaDTO dto) {
        Estadia estadia = estadiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estadía no encontrada"));

        Huesped responsable = huespedRepository.findById(dto.getIdResponsable())
                .orElseThrow(() -> new RuntimeException("Responsable no encontrado"));

        List<Huesped> acompanantes = new ArrayList<>();
        if (dto.getIdsAcompanantes() != null && !dto.getIdsAcompanantes().isEmpty()) {
            acompanantes = huespedRepository.findAllById(dto.getIdsAcompanantes());
            if (acompanantes.size() != dto.getIdsAcompanantes().size()) {
                throw new RuntimeException("Algunos acompañantes no fueron encontrados");
            }
        }

        // Solo se permite actualizar los huespedes para este caso de uso
        estadia.setHuesped(responsable);
        estadia.setAcompanantes(acompanantes);

        return estadiaRepository.save(estadia);
    }

    public boolean huespedTieneEstadias(String docNum) {
        return estadiaRepository.countByHuespedNumeroDocumento(docNum) > 0;
    }
}
