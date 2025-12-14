package com.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.repository.*;
import com.model.*;
import com.dto.DetalleFacturacionDTO;
import java.util.Optional;
import java.util.ArrayList;

public class FacturaServiceTest {

    @Mock
    private EstadiaRepository estadiaRepository;
    @Mock
    private ConsumoRepository consumoRepository;
    @Mock
    private FacturaRepository facturaRepository;
    @Mock
    private HabitacionRepository habitacionRepository;
    @Mock
    private PersonaJuridicaRepository personaJuridicaRepository;
    @Mock
    private PersonaFisicaRepository personaFisicaRepository;

    @InjectMocks
    private FacturaService facturaService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testObtenerDetalleFacturacion_Success() {
        String habNum = "101";
        Estadia estadia = new Estadia();
        estadia.setId(1);
        estadia.setFechaDesde(java.time.LocalDate.of(2023, 1, 1));
        estadia.setFechaHasta(java.time.LocalDate.of(2023, 1, 5)); 
        Huesped h = new Huesped();
        h.setApellido("Main");
        estadia.setHuesped(h);
        estadia.setAcompanantes(new ArrayList<>());

        when(estadiaRepository.findByHabitacionNumeroActiva(habNum)).thenReturn(Optional.of(estadia));
        when(consumoRepository.findByEstadiaId(1)).thenReturn(new ArrayList<>());

        DetalleFacturacionDTO result = facturaService.obtenerDetalleFacturacion(habNum);

        assertNotNull(result);
        assertEquals(200000.0, result.getMontoEstadia()); 
    }

    @Test
    public void testBuscarResponsablePorCuit_Juridica() {
        String cuit = "30112233445";
        PersonaJuridica pj = new PersonaJuridica();
        pj.setCuit(cuit);
        when(personaJuridicaRepository.findByCuit(cuit)).thenReturn(Optional.of(pj));

        Object result = facturaService.buscarResponsablePorCuit(cuit);
        assertTrue(result instanceof PersonaJuridica);
    }

    @Test
    public void testBuscarResponsablePorCuit_NotFound() {
        String cuit = "99999999999";
        when(personaJuridicaRepository.findByCuit(cuit)).thenReturn(Optional.empty());
        when(personaFisicaRepository.findByCuit(cuit)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            facturaService.buscarResponsablePorCuit(cuit);
        });
    }
}
