package com.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.model.Huesped;
import com.service.HuespedService;
import jakarta.validation.Valid; 

@RestController
@RequestMapping("/api/huespedes")
@CrossOrigin(origins = "*") 
public class HuespedController {

    @Autowired
    private HuespedService huespedService;

    @PostMapping
    // Si la validación falla, no entra al método, sino que salta al GlobalExceptionHandler.
    public ResponseEntity<?> darAltaHuesped(@Valid @RequestBody Huesped huesped, 
                                            @RequestParam(required = false) boolean force) { 
        try {
            Huesped nuevoHuesped = huespedService.crearHuesped(huesped, force);
            return new ResponseEntity<>(nuevoHuesped, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }
}