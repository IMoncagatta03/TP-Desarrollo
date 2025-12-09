package com.controller;

import com.dto.CreateEstadiaDTO;
import com.model.Estadia;
import com.service.EstadiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/estadias")
@CrossOrigin(origins = "*")
public class EstadiaController {

    @Autowired
    private EstadiaService estadiaService;

    @PostMapping
    public ResponseEntity<Estadia> createEstadia(@RequestBody CreateEstadiaDTO dto) {
        try {
            Estadia nuevaEstadia = estadiaService.createEstadia(dto);
            return ResponseEntity.ok(nuevaEstadia);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Estadia> updateEstadia(@PathVariable Integer id, @RequestBody CreateEstadiaDTO dto) {
        try {
            Estadia estadiaActualizada = estadiaService.updateEstadia(id, dto);
            return ResponseEntity.ok(estadiaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/check-huesped/{docNum}")
    public ResponseEntity<Boolean> checkHuespedEstadias(@PathVariable String docNum) {
        return ResponseEntity.ok(estadiaService.huespedTieneEstadias(docNum));
    }
}
