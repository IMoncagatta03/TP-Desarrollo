package com.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.model.Huesped;
import com.service.HuespedService;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/huespedes")
@CrossOrigin(origins = "*")
public class HuespedController {

    @Autowired
    private HuespedService huespedService;

    @PostMapping
    public ResponseEntity<?> darAltaHuesped(@Valid @RequestBody Huesped huesped,
            @RequestParam(required = false) boolean force,
            @RequestParam(required = false) String oldNumeroDocumento) {
        try {
            Huesped nuevoHuesped = huespedService.crearHuesped(huesped, force, oldNumeroDocumento);
            return new ResponseEntity<>(nuevoHuesped, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @GetMapping
    public List<com.dto.HuespedDTO> listarHuespedesCapeados() {
        return huespedService.obtenerTodos();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<com.dto.HuespedDTO>> buscarHuespedes(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String apellido,
            @RequestParam(required = false) com.enums.TipoDoc tipoDocumento,
            @RequestParam(required = false) String numeroDocumento) {
        List<com.dto.HuespedDTO> resultados = huespedService.buscarHuespedes(nombre, apellido, tipoDocumento,
                numeroDocumento);
        return new ResponseEntity<>(resultados, HttpStatus.OK);
    }

    @GetMapping("/{numeroDocumento}")
    public ResponseEntity<?> obtenerHuesped(@PathVariable String numeroDocumento) {
        Huesped huesped = huespedService.obtenerHuespedPorDocumento(numeroDocumento);
        if (huesped != null) {
            return new ResponseEntity<>(huesped, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Huésped no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{numeroDocumento}")
    public ResponseEntity<?> eliminarHuesped(@PathVariable String numeroDocumento) {
        try {
            huespedService.deleteHuesped(numeroDocumento);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("No se pudo eliminar el huésped", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}