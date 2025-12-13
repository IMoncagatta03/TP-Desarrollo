package com.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

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
}
