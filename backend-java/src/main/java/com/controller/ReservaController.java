package com.controller;

import com.dto.ReservaDTO;
import com.model.Reserva;
import com.service.ReservaService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @PostMapping
    public ResponseEntity<?> crearReservas(@RequestBody List<ReservaDTO> reservasDTO) {
        try {
            List<Reserva> nuevasReservas = reservaService.crearReservas(reservasDTO);
            return new ResponseEntity<>(nuevasReservas, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno al crear las reservas.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Reserva>> buscarReservas(
            @RequestParam String apellido,
            @RequestParam(required = false) String nombres) {
        List<Reserva> reservas = reservaService.buscarReservas(apellido, nombres);
        if (reservas.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(reservas, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelarReserva(@PathVariable Integer id) {
        try {
            reservaService.cancelarReserva(id);
            return new ResponseEntity<>("Reserva cancelada exitosamente.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno al cancelar la reserva.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
