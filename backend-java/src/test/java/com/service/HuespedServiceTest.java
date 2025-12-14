package com.service;

import static org.mockito.ArgumentMatchers.any;
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

import java.util.List;
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
    @Test
    public void testCrearHuesped_Nuevo_Success() throws Exception {
        Huesped h = new Huesped();
        h.setNumeroDocumento("123");
        h.setApellido("Perez");

        when(huespedRepository.existsById("123")).thenReturn(false);
        when(huespedRepository.save(h)).thenReturn(h);

        Huesped result = huespedService.crearHuesped(h, false, null);

        assertNotNull(result);
        verify(huespedRepository, times(1)).save(h);
    }

    @Test
    public void testCrearHuesped_Duplicado_SinForce() {
        Huesped h = new Huesped();
        h.setNumeroDocumento("123");

        when(huespedRepository.existsById("123")).thenReturn(true);

        Exception ex = assertThrows(Exception.class, () -> {
            huespedService.crearHuesped(h, false, null);
        });

        assertTrue(ex.getMessage().contains("ya existen"));
    }
    @Test
    public void testCrearHuesped_Existente_ForceTrue() throws Exception {
        Huesped existente = new Huesped();
        existente.setNumeroDocumento("123");
        existente.setApellido("Viejo");

        Huesped nuevo = new Huesped();
        nuevo.setNumeroDocumento("123");
        nuevo.setApellido("Nuevo");

        when(huespedRepository.existsById("123")).thenReturn(true);
        when(huespedRepository.findById("123")).thenReturn(Optional.of(existente));
        when(huespedRepository.save(any(Huesped.class))).thenReturn(existente);

        Huesped result = huespedService.crearHuesped(nuevo, true, null);

        assertEquals("Nuevo", result.getApellido());
        verify(huespedRepository).save(existente);
    }
    @Test
    public void testObtenerTodos() {
        Huesped h = new Huesped();
        h.setNombres("Juan");
        h.setApellido("Perez");
        h.setNumeroDocumento("123");

        when(huespedRepository.findAll()).thenReturn(List.of(h));

        var result = huespedService.obtenerTodos();

        assertEquals(1, result.size());
        assertEquals("Juan", result.get(0).getNombres());
    }


}
