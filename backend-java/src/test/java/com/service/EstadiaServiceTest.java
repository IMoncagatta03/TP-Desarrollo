package com.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;

import com.dto.CreateEstadiaDTO;
import com.enums.EstadoEstadia;
import com.model.Estadia;
import com.model.Habitacion;
import com.model.Huesped;
import com.repository.EstadiaRepository;

import com.repository.HabitacionRepository;
import com.repository.HuespedRepository;

public class EstadiaServiceTest {

    @Mock
    private EstadiaRepository estadiaRepository;

    @Mock
    private HuespedRepository huespedRepository;

    @Mock
    private HabitacionRepository habitacionRepository;

    @InjectMocks
    private EstadiaService estadiaService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testHuespedTieneEstadias_True() {
        String doc = "111";
        when(estadiaRepository.countByHuespedNumeroDocumento(doc)).thenReturn(1L);
        assertTrue(estadiaService.huespedTieneEstadias(doc));
    }

    @Test
    public void testHuespedTieneEstadias_False() {
        String doc = "111";
        when(estadiaRepository.countByHuespedNumeroDocumento(doc)).thenReturn(0L);
        assertFalse(estadiaService.huespedTieneEstadias(doc));
    }
    @Test
    void testCreateEstadia_OK() {
    CreateEstadiaDTO dto = new CreateEstadiaDTO();
    dto.setIdResponsable("123");
    dto.setIdHabitacion("101");

    Huesped responsable = new Huesped();
    Habitacion habitacion = new Habitacion();

    Mockito.when(huespedRepository.findById("123"))
            .thenReturn(Optional.of(responsable));

    Mockito.when(habitacionRepository.findById("101"))
            .thenReturn(Optional.of(habitacion));

    Mockito.when(estadiaRepository.save(Mockito.any(Estadia.class)))
            .thenAnswer(i -> i.getArgument(0));

    Estadia result = estadiaService.createEstadia(dto);

    Assertions.assertNotNull(result);
    Assertions.assertEquals(EstadoEstadia.VIGENTE, result.getEstado());
    }


    @Test
    void testCreateEstadia_ResponsableNoExiste() {
    CreateEstadiaDTO dto = new CreateEstadiaDTO();
    dto.setIdResponsable("999");

    Mockito.when(huespedRepository.findById("999"))
            .thenReturn(Optional.empty());

    Assertions.assertThrows(RuntimeException.class,
            () -> estadiaService.createEstadia(dto));
    }
    @Test
    void testUpdateEstadia_OK() {
        Integer estadiaId = 1;

        CreateEstadiaDTO dto = new CreateEstadiaDTO();
        dto.setIdResponsable("123");

        Estadia estadiaExistente = new Estadia();
        Huesped nuevoResponsable = new Huesped();

        Mockito.when(estadiaRepository.findById(estadiaId))
                .thenReturn(Optional.of(estadiaExistente));

        Mockito.when(huespedRepository.findById("123"))
                .thenReturn(Optional.of(nuevoResponsable));

        Mockito.when(estadiaRepository.save(Mockito.any(Estadia.class)))
                .thenAnswer(i -> i.getArgument(0));

        Estadia result = estadiaService.updateEstadia(estadiaId, dto);

        Assertions.assertNotNull(result);
        Assertions.assertEquals(nuevoResponsable, result.getHuesped());
    }
    @Test
    void testUpdateEstadia_EstadiaNoExiste() {
    Integer estadiaId = 99;

    CreateEstadiaDTO dto = new CreateEstadiaDTO();
    dto.setIdResponsable("123");

    Mockito.when(estadiaRepository.findById(estadiaId))
            .thenReturn(Optional.empty());

    Assertions.assertThrows(RuntimeException.class,
            () -> estadiaService.updateEstadia(estadiaId, dto));
    }

}
