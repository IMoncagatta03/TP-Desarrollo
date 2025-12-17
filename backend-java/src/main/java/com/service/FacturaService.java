package com.service;

import com.dto.DetalleFacturacionDTO;
import com.enums.EstadoHab;
import com.model.*;
import com.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class FacturaService {

    @Autowired
    private EstadiaRepository estadiaRepository;
    @Autowired
    private ConsumoRepository consumoRepository;
    @Autowired
    private FacturaRepository facturaRepository;
    @Autowired
    private HabitacionRepository habitacionRepository;
    @Autowired
    private PersonaJuridicaRepository personaJuridicaRepository;

    @Transactional(readOnly = true)
    public DetalleFacturacionDTO obtenerDetalleFacturacion(String numeroHabitacion) {
        Estadia estadia = estadiaRepository.findByHabitacionNumeroActiva(numeroHabitacion)
                .orElseThrow(
                        () -> new RuntimeException("No hay una estadía activa para la habitación " + numeroHabitacion));

        List<Consumo> consumos = consumoRepository.findByEstadiaId(estadia.getId());

        long dias = ChronoUnit.DAYS.between(estadia.getFechaDesde(), estadia.getFechaHasta());
        if (dias == 0)
            dias = 1;

        Double montoEstadia = dias * 50000.0; // Base rate per night
        Double montoConsumos = consumos.stream().mapToDouble(c -> c.getPrecio() * c.getCantidad()).sum();

        List<Huesped> ocupantes = estadia.getAcompanantes();
        ocupantes.add(0, estadia.getHuesped());

        return new DetalleFacturacionDTO(estadia, ocupantes, consumos, montoEstadia, montoConsumos);
    }

    @Transactional
    public Factura crearFactura(Integer idEstadia, Integer idResponsable, String tipoFactura, boolean facturarEstadia,
            List<Integer> idsConsumos) {
        Estadia estadia = estadiaRepository.findById(idEstadia)
                .orElseThrow(() -> new RuntimeException("Estadía no encontrada"));

        // Filter selected consumptions
        List<Consumo> todosConsumos = consumoRepository.findByEstadiaId(estadia.getId());
        List<Consumo> consumosA_Facturar = todosConsumos.stream()
                .filter(c -> idsConsumos != null && idsConsumos.contains(c.getId()))
                .toList();

        Double montoEstadia = 0.0;
        if (facturarEstadia) {
            long dias = ChronoUnit.DAYS.between(estadia.getFechaDesde(), estadia.getFechaHasta());
            if (dias == 0)
                dias = 1;
            montoEstadia = dias * 50000.0;
        }

        Double montoConsumos = consumosA_Facturar.stream().mapToDouble(c -> c.getPrecio() * c.getCantidad()).sum();

        Factura factura = new Factura();
        factura.setEstadia(estadia);
        factura.setMontoTotal(montoEstadia + montoConsumos);
        factura.setTipoFactura(tipoFactura);
        factura.setEstadoFactura("PENDIENTE_PAGO");

        return facturaRepository.save(factura);
    }

    @Autowired
    private PersonaFisicaRepository personaFisicaRepository;

    public Object buscarResponsablePorCuit(String cuit) {

        var pj = personaJuridicaRepository.findByCuit(cuit);
        if (pj.isPresent()) {
            return pj.get();
        }

        var pf = personaFisicaRepository.findByCuit(cuit);
        if (pf.isPresent()) {
            return mapPersonaFisicaToDto(pf.get());
        }

        throw new RuntimeException("Responsable no encontrado con CUIT: " + cuit);
    }

    private java.util.Map<String, Object> mapPersonaFisicaToDto(PersonaFisica pf) {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", pf.getId());
        if (pf.getRazonSocial() != null && !pf.getRazonSocial().isEmpty()) {
            map.put("razonSocial", pf.getRazonSocial());
        } else if (pf.getHuesped() != null) {
            String nombreCompleto = pf.getHuesped().getApellido() + ", " + pf.getHuesped().getNombres();
            map.put("razonSocial", nombreCompleto);
        }

        if (pf.getHuesped() != null) {
            map.put("direccion", pf.getHuesped().getDireccion());
        }
        return map;
    }
}
