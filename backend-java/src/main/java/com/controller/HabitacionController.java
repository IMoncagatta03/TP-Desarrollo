package com.controller;

import com.dto.HabitacionEstadoDTO;
import com.service.HabitacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/habitaciones")
@CrossOrigin(origins = "*") // Allow frontend access
public class HabitacionController {

    @Autowired
    private HabitacionService habitacionService;

    @GetMapping("/estado")
    public List<HabitacionEstadoDTO> obtenerEstadoHabitaciones(
            @RequestParam("fechaDesde") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam("fechaHasta") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta) {
        return habitacionService.obtenerEstadoHabitaciones(fechaDesde, fechaHasta);
    }
}
