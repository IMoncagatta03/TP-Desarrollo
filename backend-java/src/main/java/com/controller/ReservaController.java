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
}
