package com.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.repository.HuespedRepository;
import com.repository.EstadiaRepository;
import com.repository.DireccionRepository;
import com.model.Huesped;

import java.util.Optional;

public class HuespedServiceTest {

    @Mock
    private HuespedRepository huespedRepository;

    @Mock
    private EstadiaRepository estadiaRepository;

    @Mock
    private DireccionRepository direccionRepository;

    @InjectMocks
    private HuespedService huespedService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testPuedeEliminarHuesped_True() {
        String doc = "12345678";
        when(estadiaRepository.countByHuespedNumeroDocumento(doc)).thenReturn(0L);

        boolean result = huespedService.puedeEliminarHuesped(doc);
        assertTrue(result);
    }

    @Test
    public void testPuedeEliminarHuesped_False() {
        String doc = "12345678";
        when(estadiaRepository.countByHuespedNumeroDocumento(doc)).thenReturn(2L);

        boolean result = huespedService.puedeEliminarHuesped(doc);
        assertFalse(result);
    }

    @Test
    public void testDeleteHuesped_Success() throws Exception {
        String doc = "12345678";
        Huesped h = new Huesped();
        h.setNumeroDocumento(doc);

        when(estadiaRepository.countByHuespedNumeroDocumento(doc)).thenReturn(0L);
        when(huespedRepository.findById(doc)).thenReturn(Optional.of(h));

        huespedService.deleteHuesped(doc);

        verify(huespedRepository, times(1)).deleteById(doc);
    }

    @Test
    public void testDeleteHuesped_ThrowsException_IfHasStays() {
        String doc = "12345678";
        when(estadiaRepository.countByHuespedNumeroDocumento(doc)).thenReturn(1L);

        Exception exception = assertThrows(Exception.class, () -> {
            huespedService.deleteHuesped(doc);
        });

        assertTrue(exception.getMessage().contains("no puede ser eliminado"));
    }
}
