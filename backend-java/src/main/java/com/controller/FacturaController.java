package com.controller;

import com.dto.DetalleFacturacionDTO;
import com.model.Factura;
import com.service.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/facturacion")
@CrossOrigin(origins = "*")
public class FacturaController {

    @Autowired
    private FacturaService facturaService;

    @GetMapping("/detalle")
    public ResponseEntity<?> obtenerDetalle(@RequestParam String habitacion) {
        try {
            DetalleFacturacionDTO detalle = facturaService.obtenerDetalleFacturacion(habitacion);
            return new ResponseEntity<>(detalle, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<?> crearFactura(@RequestBody Map<String, Object> payload) {
        try {
            Integer idEstadia = (Integer) payload.get("idEstadia");
            String tipoFactura = (String) payload.get("tipoFactura");
            

            Factura factura = facturaService.crearFactura(idEstadia, null, tipoFactura);
            return new ResponseEntity<>(factura, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear factura: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/responsable/{cuit}")
    public ResponseEntity<?> buscarResponsable(@PathVariable String cuit) {
        try {
            
            String cleanCuit = cuit.replaceAll("[^0-9]", "");

            var responsable = facturaService.buscarResponsablePorCuit(cleanCuit);

            
            return new ResponseEntity<>(responsable, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
